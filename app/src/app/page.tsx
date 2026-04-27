"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { SIMULATION_INTRO } from '@/lib/narrative';
import {
  ArrowRight, Shield, TrendingUp, Users, BarChart3,
  CheckCircle2, ChevronRight, Lock, AlertTriangle, Star
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'role' | 'scoring' | 'how'>('overview');
  const setSession = useGameStore((state) => state.setSession);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      setSession(code.toUpperCase(), 'student', name);
      router.push('/game');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Case Overview' },
    { id: 'role', label: 'Your Role' },
    { id: 'scoring', label: 'Grading' },
    { id: 'how', label: 'Levers' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#020817] bg-grid text-slate-100 flex flex-col">
      
      {/* ── TOPBAR ─────────────────────────────────────── */}
      <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-[0.2em] uppercase">CompSim Pro</div>
            <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">MBA · Compensation & Benefits Simulation</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Simulation Engine Online · v3.0
        </div>
      </header>

      {/* ── MAIN LAYOUT ────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">

        {/* ── LEFT PANEL: CASE STUDY BRIEF ─────────────── */}
        <div className="flex-1 p-8 lg:p-12 lg:pr-8 border-r border-white/5 overflow-y-auto">

          {/* Case header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full mb-5">
              <Star className="w-3 h-3" />
              MBA Case Study · Compensation & Benefits
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-black italic text-white leading-[1.1] mb-3">
              {SIMULATION_INTRO.company_name}
            </h1>
            <p className="text-slate-400 text-sm font-medium mb-1">
              "{SIMULATION_INTRO.company_tagline}"
            </p>
            <div className="flex items-center gap-4 mt-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              <span>{SIMULATION_INTRO.simulation_format.rounds} Rounds</span>
              <span>·</span>
              <span>Pre-IPO Scenario</span>
              <span>·</span>
              <span>India Market</span>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 bg-slate-900/80 border border-white/5 rounded-xl p-1 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 py-2 px-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  activeSection === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-4">
                  {SIMULATION_INTRO.company_profile.headline}
                </h3>
                <p className="prose-narrative text-sm leading-relaxed whitespace-pre-line">
                  {SIMULATION_INTRO.company_profile.body}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Employees', value: '4,200+', icon: Users, color: 'text-indigo-400' },
                  { label: 'Cities', value: '38', icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'IPO Valuation', value: '₹22,000Cr', icon: BarChart3, color: 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-center">
                    <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-2`} />
                    <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Strategic Context</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sequoia Capital's Mumbai office has formally requested a "People Risk" report before committing to the final pre-IPO funding round. The Board has issued an emergency mandate: modernize the compensation architecture before the IPO lock-in window closes in <strong className="text-amber-400">6 quarters</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Round Roadmap */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-5">Simulation Roadmap — 6 Quarters</h3>
                <div className="space-y-2">
                  {[
                    { r: 1, act: 'ACT I', title: 'The Silent Exodus', label: 'Baseline Audit' },
                    { r: 2, act: 'ACT II', title: 'The Quota Plateau', label: 'Performance Overhaul' },
                    { r: 3, act: 'ACT III', title: 'The Equity Whistleblower', label: 'Equity Intervention' },
                    { r: 4, act: 'ACT IV', title: 'The Dubai Calling', label: 'Retention Crisis' },
                    { r: 5, act: 'ACT V', title: 'The Agency Problem', label: 'Executive Alignment' },
                    { r: 6, act: 'ACT VI', title: 'The IPO Exit Interview', label: 'IPO Certification' },
                  ].map(item => (
                    <div key={item.r} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400 flex-shrink-0 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                        {item.r}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-600 font-mono uppercase">{item.act}</span>
                          <span className="text-[9px] text-slate-700">·</span>
                          <span className="text-[10px] text-indigo-400 font-bold">{item.label}</span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium">{item.title}</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: YOUR ROLE ── */}
          {activeSection === 'role' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Your Designation</div>
                    <h2 className="text-xl font-black text-white">{SIMULATION_INTRO.your_role.title}</h2>
                    <div className="text-xs text-indigo-400 mt-1 font-mono">{SIMULATION_INTRO.your_role.seniority}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line prose-narrative">
                  {SIMULATION_INTRO.your_role.mandate}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-5">Key Stakeholders</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Arjun Kapoor', role: 'Group CEO', note: 'Issued Project Phoenix mandate. Expects market-competitive, IPO-ready comp strategy.', color: 'border-indigo-500/40' },
                    { name: 'Ananya Mehta', role: 'CHRO · Your Direct Manager', note: 'Accountable to Board for People Risk score. Your decisions reflect on her.', color: 'border-emerald-500/40' },
                    { name: 'Rajesh Sharma', role: 'CFO', note: 'Approves all merit budgets. Will flag any allocation above ₹5L as requiring sign-off.', color: 'border-amber-500/40' },
                    { name: 'Meera Krishnan', role: 'Board Chair', note: 'Presented your final HES to Sequoia Capital. Watching every round.', color: 'border-rose-500/40' },
                  ].map(s => (
                    <div key={s.name} className={`border-l-2 ${s.color} pl-4 py-2`}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white">{s.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{s.role}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: SCORING ── */}
          {activeSection === 'scoring' && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-2">{SIMULATION_INTRO.scoring_rubric.headline}</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{SIMULATION_INTRO.scoring_rubric.description}</p>
                <div className="space-y-4">
                  {SIMULATION_INTRO.scoring_rubric.pillars.map((p, i) => (
                    <div key={i} className="bg-slate-950/60 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <span className="text-xs font-black text-indigo-400 font-mono">{p.weight}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                      <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                          style={{ width: p.weight }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">{SIMULATION_INTRO.scoring_rubric.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: HOW TO PLAY ── */}
          {activeSection === 'how' && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Each round, you control six strategic levers. These are not sliders — they are business decisions with compounding consequences.
              </p>
              {SIMULATION_INTRO.simulation_format.decisions_per_round.map((d, i) => (
                <div key={i} className="bg-slate-900/60 border border-white/5 rounded-xl p-4 flex items-start gap-3 hover:border-indigo-500/20 transition-colors">
                  <div className="w-6 h-6 bg-indigo-600/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{d.lever}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: LOGIN ───────────────────────── */}
        <div className="w-full lg:w-[420px] p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Login Box */}
          <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-8 glow-indigo mb-6">
            <div className="mb-8">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Step 1 of 1</div>
              <h2 className="text-2xl font-black text-white">Enter the Simulation</h2>
              <p className="text-sm text-slate-500 mt-1">Your professor will provide the session code.</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Session Code
                </label>
                <input
                  id="session-code-input"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-700 outline-none transition font-mono text-sm tracking-[0.2em]"
                  placeholder="E.G. MBA2026"
                  maxLength={8}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  id="player-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950/80 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-slate-700 outline-none transition text-sm"
                  placeholder="First & Last Name"
                  autoComplete="name"
                />
              </div>

              <button
                id="enter-simulation-btn"
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2 group text-sm"
              >
                Enter Simulation Floor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Lock badge */}
            <div className="flex items-center gap-2 mt-5 text-[10px] text-slate-600">
              <Lock className="w-3 h-3" />
              <span>Session is end-to-end encrypted. No data is stored externally.</span>
            </div>
          </div>

          {/* Session Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Simulation Rounds', value: '6 Quarters', icon: '🗓' },
              { label: 'Team Size', value: 'Individual', icon: '👤' },
              { label: 'Decision Levers', value: '6 Per Round', icon: '⚙️' },
              { label: 'Graded Outcome', value: 'HES Score', icon: '📊' },
            ].map(item => (
              <div key={item.label} className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-xs font-bold text-white">{item.value}</div>
                <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Admin link */}
          <div className="text-center">
            <button
              id="admin-access-btn"
              onClick={() => router.push('/admin')}
              className="text-[10px] text-slate-700 hover:text-slate-500 transition font-mono uppercase tracking-widest"
            >
              Professor / Admin Access →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
