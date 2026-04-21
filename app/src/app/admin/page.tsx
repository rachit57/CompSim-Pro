"use client";

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socketClient';
import { Zap, Play, FastForward, Users, Settings, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [sessionCode, setSessionCode] = useState('MBA2026');
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join_session', { sessionCode, role: 'admin', playerName: 'Professor' });

    socket.on('session_update', (data) => setSessionData(data));
    socket.on('game_started', (data) => setSessionData(data));
    socket.on('round_advanced', (data) => setSessionData(data));

    return () => {
      socket.off('session_update');
      socket.off('game_started');
      socket.off('round_advanced');
    };
  }, [sessionCode]);

  const startGame = () => {
    socket.emit('start_game', { sessionCode, theme: 'hyper_scale' });
  };

  const advanceRound = () => {
    socket.emit('advance_round', { sessionCode });
  };

  const handleReset = () => {
    if (confirm('CRITICAL: Are you sure you want to WIPE the entire session? This will kick all students out.')) {
      socket.emit('reset_session', { sessionCode });
    }
  };

  const injectShock = (shockId: string) => {
    socket.emit('inject_shock', { sessionCode, targetId: 'all', shockId });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 grid grid-cols-12 gap-6 font-sans">
      
      {/* Left Sidebar - Controls */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[calc(100vh-3rem)] shadow-2xl">
        <h1 className="text-xl font-black mb-8 flex items-center text-rose-500 italic tracking-tighter">
          <Settings className="mr-2 w-5 h-5" /> GOD MODE v2.1
        </h1>
        
        <div className="space-y-4 flex-grow">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
             <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Active Session</div>
             <div className="text-2xl font-mono font-bold text-indigo-400">{sessionCode}</div>
          </div>
          
          <button 
                onClick={startGame}
                disabled={sessionData?.round > 1 && sessionData?.status === 'active'}
                className="w-full flex items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20"
          >
            <Play className="mr-2 w-5 h-5" /> Start Simulation
          </button>

          <button 
            onClick={advanceRound}
            disabled={!sessionData || sessionData.round >= 6}
            className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-indigo-500/20"
          >
            <FastForward className="mr-2 w-5 h-5" /> Next Strategic Round
          </button>

          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center py-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-500 border border-rose-500/30 rounded-xl font-bold uppercase text-[10px] tracking-widest transition mt-4"
          >
            <AlertTriangle className="mr-2 w-3 h-3" /> Reset Session
          </button>

          <div className="pt-8 mt-8 border-t border-slate-800">
             <h3 className="text-[10px] font-black text-slate-500 uppercase mb-4 flex items-center tracking-[0.2em]">
               <Zap className="mr-2 w-4 h-4 text-amber-500" /> Manual Shocks
             </h3>
             <div className="space-y-2">
               <button 
                  onClick={() => injectShock('poach_tech')}
                  className="w-full py-2 text-xs border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 rounded-lg font-bold transition"
               >
                  Poaching Strike
               </button>
               <button 
                  onClick={() => injectShock('equity_audit')}
                  className="w-full py-2 text-xs border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 rounded-lg font-bold transition"
               >
                  Parity Audit
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Panel - Leaderboard */}
      <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[calc(100vh-3rem)] overflow-hidden flex flex-col shadow-2xl">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-black uppercase tracking-tighter">Cohort Performance</h2>
           <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-2 gap-4">
             <div className="flex items-center px-4 py-1">
               <Users className="w-4 h-4 mr-2 text-indigo-400" /> 
               <span className="text-sm font-bold">{sessionData ? Object.keys(sessionData.players).length : 0} Enrolled</span>
             </div>
             <div className="flex items-center px-4 py-1 border-l border-slate-800">
               <Activity className="w-4 h-4 mr-2 text-rose-500" />
               <span className="text-sm font-bold text-rose-400">Avg Parity Risk: 0.082</span>
             </div>
           </div>
         </div>

         <div className="flex-grow overflow-auto border border-slate-800 rounded-xl bg-slate-950">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-800 text-slate-300 text-sm uppercase tracking-wider">
                 <th className="p-4 border-b border-slate-700">Rank</th>
                 <th className="p-4 border-b border-slate-700">Student Name</th>
                 <th className="p-4 border-b border-slate-700">HES Score</th>
                 <th className="p-4 border-b border-slate-700">Status</th>
               </tr>
             </thead>
             <tbody>
               {sessionData?.players && Object.keys(sessionData.players).filter(id => sessionData.players[id].role !== 'admin').map((id, index) => (
                 <tr key={id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                   <td className="p-4">{index + 1}</td>
                   <td className="p-4 font-semibold">{sessionData.players[id].name}</td>
                   <td className="p-4 text-emerald-400 font-mono text-lg">{sessionData.players[id].score || '--'}</td>
                   <td className="p-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span></td>
                 </tr>
               ))}
               {!sessionData?.players || Object.keys(sessionData.players).length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-8 text-center text-slate-500">Waiting for students to join...</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
