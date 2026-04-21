"use client";

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socketClient';
import { Zap, Play, FastForward, Users, Settings } from 'lucide-react';

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

  const injectShock = () => {
    socket.emit('inject_shock', { sessionCode, targetId: 'all', shockId: 1 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 grid grid-cols-12 gap-6">
      
      {/* Left Sidebar - Controls */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[calc(100vh-3rem)]">
        <h1 className="text-xl font-bold mb-8 flex items-center text-rose-500">
          <Settings className="mr-2" /> God Mode
        </h1>
        
        <div className="space-y-4 flex-grow">
          <div className="bg-slate-800 p-4 rounded-lg">
             <div className="text-xs text-slate-400 uppercase">Session Code</div>
             <div className="text-2xl font-mono">{sessionCode}</div>
          </div>
          
          <button 
            onClick={startGame}
            disabled={sessionData?.status !== 'waiting'}
            className="w-full flex items-center justify-center py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
          >
            <Play className="mr-2 w-5 h-5" /> Launch Session
          </button>
          
          <button 
            onClick={advanceRound}
            disabled={sessionData?.status !== 'active'}
            className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
          >
            <FastForward className="mr-2 w-5 h-5" /> Force Round Advance
          </button>

          <div className="pt-8 mt-8 border-t border-slate-800">
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center">
               <Zap className="mr-2 w-4 h-4 text-amber-500" /> Shock Injection
             </h3>
             <button 
                onClick={injectShock}
                className="w-full py-3 border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 rounded-lg font-bold transition"
             >
                Global Poaching Strike
             </button>
          </div>
        </div>
      </div>

      {/* Main Panel - Leaderboard */}
      <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-6 h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold">Class Leaderboard</h2>
           <div className="flex bg-slate-800 rounded-lg p-2">
             <div className="flex items-center px-4"><Users className="w-4 h-4 mr-2 text-indigo-400" /> {sessionData ? Object.keys(sessionData.players).length : 0} Active</div>
             <div className="flex items-center px-4 border-l border-slate-700">Round {sessionData?.round || 0}/4</div>
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
