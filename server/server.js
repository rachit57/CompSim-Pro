const express = require('express'); // v1.1.1 - Force build trigger
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');
require('dotenv').config();
const { calculateCohortStats, generateNarrativeFeedback } = require('./analytics');
const { sendStudentReport, sendProfessorSummary } = require('./mailer');

const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
let redis = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000)
  });

  redis.on('error', (err) => {
    console.error('!!! Redis Error:', err.message);
  });
  redis.on('connect', () => console.log('>>> Connected to Redis'));
  redis.on('ready', () => console.log('>>> Redis Client Ready'));
} else {
  console.log('>>> No REDIS_URL provided, running purely in-memory.');
}

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
    if (redis && redis.status === 'ready') {
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
    if (redis && redis.status === 'ready') {
      await redis.set(`session:${code}`, JSON.stringify(session), 'EX', 86400);
    }
  } catch (err) {
    console.error('!!! Redis Save Error:', err.message);
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
          isStarted: true, // FOR TESTING: Enabled by default
          isEnded: false,
          players: {},
          personas: personas,
          workforce: workforce,
          history: []
        };
      }
      
      // STUDENT RE-JOINING LOGIC (via Email)
      // Use email as the persistent key so reload doesn't reset progress
      const playerEmail = playerName; // The input labeled "Name" will now be used as unique ID (Email)
      let player = session.players[playerEmail];

      if (player) {
        // Recover existing state
        player.socketId = socket.id;
        console.log(`>>> Recovering state for ${playerEmail}`);
      } else {
        // Create new player entry
        const clonedWorkforce = JSON.parse(JSON.stringify(workforce));
        
        // Randomize the Toxic Top Performer
        const topPerformers = clonedWorkforce.filter(w => w.performance === 5);
        if (topPerformers.length > 0) {
          const toxicEmp = topPerformers[Math.floor(Math.random() * topPerformers.length)];
          toxicEmp.isToxic = true;
        }

        // Apply Fog of War (Manager Ratings) to exactly 25% of employees
        const totalEmp = clonedWorkforce.length;
        const biasedCount = Math.floor(totalEmp * 0.25);
        const biasedIndices = new Set();
        while (biasedIndices.size < biasedCount) {
          biasedIndices.add(Math.floor(Math.random() * totalEmp));
        }

        clonedWorkforce.forEach((emp, index) => {
          emp.truePerformance = emp.performance;
          emp.managerRating = emp.performance;
          
          if (biasedIndices.has(index)) {
            const bias = Math.random() > 0.5 ? 1 : -1;
            emp.managerRating = Math.max(1, Math.min(5, emp.performance + bias));
          }
          emp.performance = emp.managerRating; 
        });

        player = {
          email: playerEmail,
          socketId: socket.id,
          round: 1,
          score: null,
          politicalCapital: 100,
          shadowDebt: 0,
          isFired: false,
          isUnionStriking: false,
          decisions: [],
          workforce: clonedWorkforce,
          metrics: { engagement: 0.9, turnover: 0.05, pValue: 0.05, roi: 0.5 }
        };
        session.players[playerEmail] = player;
      }

      await saveSession(sessionCode, session);
      socket.email = playerEmail; // Attach identity
      io.to(sessionCode).emit('session_update', session);
    } catch (err) {
      console.error('!!! Join Session Error:', err);
    }
  });

  // ── PROFESSOR / ADMIN CONTROLS ─────────────────────────────────────────────

  socket.on('admin_login', ({ email, password }) => {
    // FOR TESTING: Accepting any credentials
    socket.emit('admin_auth_success', { email });
  });

  socket.on('start_global_simulation', async ({ sessionCode }) => {
    let session = await getSession(sessionCode);
    if (!session) return;
    
    session.isStarted = true;
    session.round = 1;
    
    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('session_update', session);
    io.to(sessionCode).emit('game_started', session);
  });

  socket.on('advance_global_round', async ({ sessionCode }) => {
    let session = await getSession(sessionCode);
    if (!session || session.round >= 6) return;

    session.round += 1;
    // Reset submission status for all players for the new round
    Object.values(session.players).forEach((p) => {
      p.isSubmitted = false;
      p.round = session.round; // Sync individual round to global
    });
    
    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('session_update', session);
  });

  socket.on('end_simulation', async ({ sessionCode }) => {
    let session = await getSession(sessionCode);
    if (!session) return;

    session.isEnded = true;
    
    // --- PHASE 2: ANALYTICS & MAILING ---
    const players = Object.values(session.players);
    const cohortStats = calculateCohortStats(players);
    const leaderboard = [...players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);

    // 1. Send Individual Student Reports
    for (const player of players) {
      const feedback = generateNarrativeFeedback(player);
      await sendStudentReport(player.email, player.email.split('@')[0], feedback);
    }

    // 2. Send Professor Summary
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'prof@compsim.pro';
    await sendProfessorSummary(ADMIN_EMAIL, cohortStats, leaderboard);

    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('session_update', session);
    io.to(sessionCode).emit('game_ended', { leaderboard: leaderboard.map(p => ({ email: p.email, score: p.score })) });
  });

  socket.on('kick_student', async ({ sessionCode, studentEmail }) => {
    let session = await getSession(sessionCode);
    if (!session || !session.players[studentEmail]) return;

    delete session.players[studentEmail];
    await saveSession(sessionCode, session);
    io.to(sessionCode).emit('session_update', session);
  });

  socket.on('submit_decision', async ({ sessionCode, decisions }) => {
    let session = await getSession(sessionCode);
    if (!session || !socket.email || !session.players[socket.email]) return;

    const player = session.players[socket.email];
    player.decisions.push(decisions);
    
    // Process the round mathematically
    const { hes, metrics, updatedWorkforce, politicalCapital, shadowDebt } = processRound(
      decisions, 
      player.workforce, 
      session.round,
      player
    );

    // Update player state and ADVANCE SELF-PACED ROUND
    player.workforce = updatedWorkforce;
    player.score = hes;
    player.metrics = metrics;
    player.politicalCapital = politicalCapital;
    player.shadowDebt = shadowDebt;
    
    if (player.round < 6) {
      player.round += 1;
      player.isSubmitted = false; // Ready for next round briefing
    } else {
      player.isSubmitted = true; // Final round complete
    }

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

  socket.on('hr_audit', async ({ sessionCode, targetId }) => {
    let session = await getSession(sessionCode);
    if (!session || !session.players[socket.id]) return;
    const player = session.players[socket.id];
    
    if (player.politicalCapital >= 5) {
      player.politicalCapital -= 5;
      const emp = player.workforce.find(w => w.id === targetId);
      if (emp) {
        emp.performance = emp.truePerformance; // Reveal truth
        emp.audited = true;
      }
      await saveSession(sessionCode, session);
      io.to(sessionCode).emit('session_update', session);
    }
  });

  socket.on('fire_employee', async ({ sessionCode, targetId }) => {
    let session = await getSession(sessionCode);
    if (!session || !session.players[socket.id]) return;
    const player = session.players[socket.id];
    
    player.politicalCapital -= 15; // Severance/Political cost
    player.workforce = player.workforce.filter(w => w.id !== targetId);
    
    await saveSession(sessionCode, session);
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
      if (session) {
        // We don't delete players on disconnect anymore to ensure persistence via Email
        // Only cleanup the socket mapping
        delete socketToSession[socket.id];
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});

