"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const setSession = useGameStore((state) => state.setSession);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      setSession(code.toUpperCase(), 'student', name);
      router.push('/game');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">CompSim Pro</h1>
          <p className="text-indigo-200">The Ultimate HRBP Strategy Simulation</p>
        </div>
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-indigo-100 mb-1">Session Code</label>
            <input 
              type="text" 
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-white/30 outline-none transition"
              placeholder="e.g. MBA2026"
              maxLength={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-indigo-100 mb-1">Your Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-white/30 outline-none transition"
              placeholder="First & Last Name"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Enter Simulation Floor
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-indigo-200/60">
          <button onClick={() => router.push('/admin')} className="hover:text-white transition">
            Access Admin God Mode
          </button>
        </div>
      </div>
    </div>
  );
}
