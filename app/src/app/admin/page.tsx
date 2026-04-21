"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import { Users, Settings, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { sessionCode, hydrated } = useGameStore();
  const [sessionData, setSessionData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionCode) {
      router.push('/');
      return;
    }

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
  }, [sessionCode, hydrated, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 grid grid-cols-12 gap-6 font-sans">
      
      {/* Left Sidebar - Status Only */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[calc(100vh-3rem)] shadow-2xl">
        <h1 className="text-xl font-black mb-8 flex items-center text-slate-500 italic tracking-tighter">
          <Settings className="mr-2 w-5 h-5" /> PROFESSOR CONSOLE
        </h1>
        
        <div className="space-y-4 flex-grow">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
             <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Session Active</div>
             <div className="text-2xl font-mono font-bold text-indigo-400">{sessionCode}</div>
          </div>
          
          <div className="bg-slate-950/50 p-6 rounded-xl border border-dashed border-slate-800 text-center">
             <div className="text-xs text-slate-600 uppercase font-bold italic">Simulation Live View Only</div>
             <p className="text-[10px] text-slate-700 mt-2">All controls are currently disabled for stability.</p>
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
