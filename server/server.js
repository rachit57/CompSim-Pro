const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');
require('dotenv').config();

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on('error', (err) => console.error('!!! Redis Error:', err));
redis.on('connect', () => console.log('>>> Connected to Redis'));
redis.on('ready', () => console.log('>>> Redis Client Ready'));

const { processRound, calculateHES } = require('./gameEngine');
const { getThemeConfig } = require('./industryThemes');
const { getRandomChallenges } = require('./eventLibrary');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}));
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Redis persistence helpers
const getSession = async (code) => {
  const data = await redis.get(`session:${code}`);
  return data ? JSON.parse(data) : null;
};

const saveSession = async (code, session) => {
  await redis.set(`session:${code}`, JSON.stringify(session), 'EX', 86400); // 24hr TTL
};

// Map to track which session a socket belongs to (for faster cleanup)
const socketToSession = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_session', async ({ sessionCode, role, playerName }) => {
    console.log(`>>> Join Attempt: ${playerName} (${role}) in session ${sessionCode} [socket:${socket.id}]`);
    socket.join(sessionCode);
    socketToSession[socket.id] = sessionCode;
    
    try {
      let session = await getSession(sessionCode);
      if (!session) {
        console.log(`>>> Creating new session: ${sessionCode}`);
        session = {
          theme: 'hyper_scale',
          round: 0,
          status: 'waiting',
          players: {},
          shocks: []
        };
      }
      
      session.players[socket.id] = {
        name: playerName,
        role: role, 
        score: null,
        decisions: []
      };

      await saveSession(sessionCode, session);
      console.log(`>>> Session Saved & Updating: ${sessionCode}`);
      io.to(sessionCode).emit('session_update', session);
    } catch (err) {
      console.error('!!! Join Session Error:', err);
    }
  });

  socket.on('start_game', async ({ sessionCode, theme }) => {
    const session = await getSession(sessionCode);
    if (session) {
      session.theme = theme;
      session.themeConfig = getThemeConfig(theme);
      session.status = 'active';
      session.round = 1;
      
      await saveSession(sessionCode, session);
      io.to(sessionCode).emit('game_started', session);
      io.to(sessionCode).emit('market_brief', {
        round: 1,
        message: 'Market Briefing: Industry is heating up.',
      });
    }
  });

  socket.on('submit_decision', async ({ sessionCode, decisions }) => {
    const session = await getSession(sessionCode);
    if (session && session.players[socket.id]) {
      const player = session.players[socket.id];
      player.decisions[session.round] = decisions;
      await saveSession(sessionCode, session);
    }
  });

  socket.on('advance_round', async ({ sessionCode }) => {
    const session = await getSession(sessionCode);
    if (session) {
      Object.keys(session.players).forEach(playerId => {
        const player = session.players[playerId];
        if (player.role !== 'admin' && player.decisions[session.round]) {
           const result = processRound(player.decisions[session.round], session.themeConfig);
           player.score = result.hes;
           player.metrics = result.metrics;
        }
      });

      session.round += 1;
      if (session.round > 4) {
        session.status = 'finished';
        io.to(sessionCode).emit('game_over', session);
      } else {
        io.to(sessionCode).emit('round_advanced', session);
      }
      await saveSession(sessionCode, session);
    }
  });

  socket.on('inject_shock', ({ sessionCode, targetId, shockId }) => {
    const shockEvents = getRandomChallenges(1);
    const shock = shockEvents[0];
    
    if (targetId === 'all') {
      io.to(sessionCode).emit('sudden_challenge', shock);
    } else {
      io.to(targetId).emit('sudden_challenge', shock);
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    const sessionCode = socketToSession[socket.id];
    
    if (sessionCode) {
      const session = await getSession(sessionCode);
      if (session && session.players[socket.id]) {
        delete session.players[socket.id];
        delete socketToSession[socket.id];
        
        if (Object.keys(session.players).length === 0) {
          await redis.del(`session:${sessionCode}`);
        } else {
          await saveSession(sessionCode, session);
          io.to(sessionCode).emit('session_update', session);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
