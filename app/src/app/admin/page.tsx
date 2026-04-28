"use client";

import React, { useState, useEffect } from 'react';
import { socket } from '@/lib/socketClient';
import { 
  Users, 
  Play, 
  ChevronRight, 
  XOctagon, 
  BarChart2, 
  Lock,
  Mail,
  Trophy,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionCode, setSessionCode] = useState('BHARAT-2026');
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();
    socket.on('admin_auth_success', () => setAuth(true));
    socket.on('admin_auth_error', (msg) => setError(msg));
    socket.on('session_update', (data) => setSessionData(data));

    return () => {
      socket.off('admin_auth_success');
      socket.off('admin_auth_error');
      socket.off('session_update');
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    socket.emit('admin_login', { email, password });
    socket.emit('join_session', { sessionCode, role: 'admin', playerName: email });
  };

  const startSimulation = () => socket.emit('start_global_simulation', { sessionCode });
  const advanceRound = () => socket.emit('advance_global_round', { sessionCode });
  const endSimulation = () => {
    if (confirm('End simulation and generate reports?')) {
      socket.emit('end_simulation', { sessionCode });
    }
  };
  const kickStudent = (email: string) => socket.emit('kick_student', { sessionCode, studentEmail: email });

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121214] border border-[#1d1d21] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Professor Login</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-2">Academic Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-[#1d1d21] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="prof@university.edu"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-2">Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-[#1d1d21] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-2">Session Code</label>
              <input 
                type="text" 
                value={sessionCode}
                onChange={e => setSessionCode(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-[#1d1d21] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              Enter Command Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  const players = sessionData?.players ? Object.values(sessionData.players).filter((p: any) => p.email !== email) : [];
  const avgHES = players.length > 0 ? (players.reduce((acc, p: any) => acc + (Number(p.score) || 0), 0) / players.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-neutral-300 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-[#1d1d21] bg-[#121214]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">CompSim Pro Dashboard</h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">Session: {sessionCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!sessionData?.isStarted ? (
              <button onClick={startSimulation} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                <Play className="w-3.5 h-3.5" /> START SESSION
              </button>
            ) : (
              <>
                <div className="bg-[#1d1d21] rounded-full px-4 py-2 border border-[#2a2a2e] flex items-center gap-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Round {sessionData?.round} of 6</span>
                  <div className="h-4 w-[1px] bg-neutral-700" />
                  <button onClick={advanceRound} className="text-[10px] font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    ADVANCE <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={endSimulation} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-bold px-5 py-2.5 rounded-full border border-red-500/20 transition-all">
                  END & MAIL REPORTS
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Active Students', value: players.length, icon: Users, color: 'text-blue-400' },
            { label: 'Cohort Avg HES', value: avgHES, icon: Trophy, color: 'text-amber-400' },
            { label: 'System Load', value: 'Nominal', icon: Activity, color: 'text-emerald-400' },
            { label: 'Reports Pending', value: players.length, icon: Mail, color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#121214] border border-[#1d1d21] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Live Cohort Monitoring */}
        <div className="bg-[#121214] border border-[#1d1d21] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-8 py-6 border-b border-[#1d1d21] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-indigo-400" /> Live Cohort Monitoring
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Live Updates Enabled</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1d1d21]/30 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Student Identity</th>
                  <th className="px-8 py-4">Current Stage</th>
                  <th className="px-8 py-4 text-center">HES Score</th>
                  <th className="px-8 py-4 text-center">Political Cap.</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d1d21]">
                {players.map((p: any) => (
                  <tr key={p.email} className="hover:bg-[#1d1d21]/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-white">{p.email.split('@')[0]}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{p.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded border border-indigo-500/20 uppercase tracking-wider">
                          Round {p.round}
                        </div>
                        {p.round < (sessionData?.round || 1) && (
                          <span className="text-[9px] text-amber-500/80 font-medium italic">Lagging Behind</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-sm font-bold font-mono ${Number(p.score) >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.score || '--'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${p.politicalCapital}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400">{p.politicalCapital}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => kickStudent(p.email)}
                        className="p-2 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Kick from session"
                      >
                        <XOctagon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-neutral-500 text-sm italic">
                      Waiting for students to join the session...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
