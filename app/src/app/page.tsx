"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const [code, setCode]   = useState('');
  const [name, setName]   = useState('');
  const [error, setError] = useState('');
  const setSession = useGameStore((s) => s.setSession);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Please enter both a session code and your name.');
      return;
    }
    setSession(code.trim().toUpperCase(), 'student', name.trim());
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] bg-grid flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">

        {/* Brand */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-5">
            MBA · Compensation &amp; Benefits
          </p>
          <h1 className="font-display text-[3.25rem] font-bold italic text-[var(--text)] leading-none mb-3">
            BharatQuick
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] font-light">
            Total Rewards Strategy Simulation
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-10" />

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">
              Session Code
            </label>
            <input
              id="session-code"
              type="text"
              required
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. MBA2026"
              maxLength={12}
              autoComplete="off"
              autoFocus
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-slate-700 text-sm font-mono tracking-widest outline-none focus:border-indigo-500/40 focus:bg-[var(--surface)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">
              Academic Email
            </label>
            <input
              id="player-email"
              type="email"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="name@university.edu"
              autoComplete="email"
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-slate-700 text-sm outline-none focus:border-indigo-500/40 focus:bg-[var(--surface)] transition-colors"
            />
            <p className="mt-2 text-[9px] text-[var(--text-muted)] leading-relaxed italic">
              * Used for your performance report and to restore your progress if you reload.
            </p>
          </div>

          {error && (
            <p className="text-[11px] text-red-400">{error}</p>
          )}

          <button
            id="enter-simulation-btn"
            type="submit"
            className="w-full mt-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-[var(--text)] text-[13px] font-medium rounded-lg transition-colors"
          >
            Enter Simulation
          </button>
        </form>

        {/* Admin link */}
        <div className="mt-10 text-center">
          <button
            id="professor-access-btn"
            onClick={() => router.push('/admin')}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors"
          >
            Professor Access
          </button>
        </div>

      </div>
    </div>
  );
}

