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

redis.on('error', (err) => {
  console.error('!!! Redis Error:', err.message);
});
redis.on('connect', () => console.log('>>> Connected to Redis'));
redis.on('ready', () => console.log('>>> Redis Client Ready'));

const { calculateHES, processRound, calculateParityPValue } = require('./gameEngine');
const { getThemeConfig } = require('./industryThemes');
const { challenges, personas, getTriggeredEvent } = require('./eventLibrary');
const { workforce } = require('./indiaWorkforce');

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

// In-memory fallback for high-scale resilience
const sessions = {};
const socketToSession = {};

const getSession = async (code) => {
  try {
    if (redis.status === 'ready') {
      const data = await redis.get(`session:${code}`);
      if (data) return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`>>> Redis Get Failed, falling back to memory for ${code}`);
  }
  return sessions[code] || null;
};

const saveSession = async (code, session) => {
  sessions[code] = session; // Always update memory
  try {
    if (redis.status === 'ready') {
      await redis.set(`session:${code}`, JSON.stringify(session), 'EX', 86400);
    }
  } catch (err) {
    console.warn(`>>> Redis Save Failed for ${code}`);
  }
};

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
          round: 1,
          status: 'active', // Direct to active for simulation flow
          players: {},
          personas: personas, // Add personas to session
          workforce: workforce, // Add India workforce master file
          history: []
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
    let session = await getSession(sessionCode);
    if (!session) return;
    
    session.status = 'active';
    session.theme = theme || 'hyper_scale';
    session.round = 1;
    
    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('game_started', session);
    io.to(sessionCode).emit('session_update', session);
  });

  socket.on('submit_decision', async ({ sessionCode, decisions }) => {
    let session = await getSession(sessionCode);
    if (!session) return;

    // Process logic here or save for round advance
    session.players[socket.id].decisions.push(decisions);
    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('session_update', session);
  });

  socket.on('reset_session', async ({ sessionCode }) => {
    console.log(`>>> RESET COMMAND RECEIVED for ${sessionCode}`);
    await redis.del(`session:${sessionCode}`);
    delete sessions[sessionCode];
    
    // Broadcast empty state or redirect
    io.to(sessionCode).emit('session_update', null);
  });

  socket.on('advance_round', async ({ sessionCode }) => {
    let session = await getSession(sessionCode);
    if (!session || session.round >= 6) return;

    session.round += 1;
    
    // Check for triggered hook (The "Market Shocks")
    const shock = getTriggeredEvent(session.round);
    if (shock) {
      io.to(sessionCode).emit('sudden_challenge', shock);
    }

    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('round_advanced', session);
    io.to(sessionCode).emit('session_update', session);
  });

  socket.on('inject_shock', ({ sessionCode, targetId, shockId }) => {
    const shockEvents = challenges; // Using imported challenges
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
