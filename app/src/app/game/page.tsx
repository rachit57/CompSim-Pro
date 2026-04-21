"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import { Activity, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export default function GameDashboard() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData } = useGameStore();

  useEffect(() => {
    if (!sessionCode) {
      router.push('/');
      return;
    }

    socket.on('session_update', (data) => updateSessionData(data));
    socket.on('game_started', (data) => updateSessionData(data));
    socket.on('round_advanced', (data) => updateSessionData(data));
    socket.on('sudden_challenge', (shock) => {
      alert(`SUDDEN CHALLENGE: ${shock.title}\n\n${shock.description}`);
      // In MVP, we'll build a nice modal for this.
    });

    return () => {
      socket.off('session_update');
      socket.off('game_started');
      socket.off('round_advanced');
      socket.off('sudden_challenge');
    };
  }, [sessionCode, router, updateSessionData]);

  if (!sessionData) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            CompSim Pro Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Player: {playerName} | Session: {sessionCode} | Role: {role}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-emerald-400">Round {sessionData.round || 0}</div>
          <div className="text-sm text-slate-400 uppercase tracking-wider">{sessionData.status}</div>
        </div>
      </header>

      {sessionData.status === 'waiting' && (
        <div className="bg-slate-800 rounded-xl p-8 text-center max-w-2xl mx-auto border border-slate-700 shadow-2xl">
          <Activity className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">Waiting for Professor</h2>
          <p className="text-slate-400">The simulation session will begin shortly. Prepare for market turbulence.</p>
        </div>
      )}

      {sessionData.status === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Panels Placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Budget Util', val: '92%', icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Turnover', val: '6.4%', icon: Users, color: 'text-rose-400' },
                { label: 'Engagement', val: '78/100', icon: TrendingUp, color: 'text-indigo-400' },
                { label: 'Pay Equity', val: '0.22', icon: Activity, color: 'text-amber-400' }
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-center">
                  <kpi.icon className={`w-8 h-8 mb-2 ${kpi.color}`} />
                  <div className="text-2xl font-bold">{kpi.val}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Decision Area Placeholder */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center"><AlertTriangle className="mr-2 text-amber-500" /> Core Decisions</h3>
              <p className="text-slate-400 italic mb-4">Make your total rewards allocations below.</p>
              <button 
                onClick={() => socket.emit('submit_decision', { sessionCode, decisions: { basePayAdj: 0.05, variablePay: 0.1, benefits: 'high' } })}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Submit Round Decisions
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
               <h3 className="text-lg font-bold mb-2">Market Intel Context</h3>
               <p className="text-sm text-slate-400">Industry Theme: {sessionData.theme}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
