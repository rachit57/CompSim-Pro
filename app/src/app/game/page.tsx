"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import {
  ROUND_STORIES,
  NARRATIVE_DOSSIER,
  EMPLOYEE_PULSE,
  CASE_STUDY_BRIEFING,
} from '@/lib/narrative';
import {
  Activity, Users, DollarSign, TrendingUp, AlertTriangle,
  ChevronRight, Zap, Target, BarChart3, MessageSquare,
  FileText, ArrowUpRight, ArrowDownRight, CheckCircle2,
  Clock, Shield, Info, TrendingDown, Star, AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  LEVER CONFIG (Rich descriptions for Strategic Console)
// ─────────────────────────────────────────────────────────────
const LEVER_CONFIG = {
  meritPool: {
    label: 'Overall Merit Pool',
    unit: '%',
    display: (v: number) => `+${Math.round(v * 100)}%`,
    color: 'indigo',
    accentClass: 'accent-indigo-500',
    trackColor: '#6366f1',
    whatItDoes: 'Applies a performance-weighted salary increase across all employees. Higher performers receive a proportionally larger share via merit matrix linkage.',
    tooHigh: 'Exceeds quarterly budget ceiling — CFO triggers mandatory spending review and flags IPO cost trajectory as unsustainable.',
    tooLow: 'Below-market increases accelerate Green Circle attrition among high performers, particularly in Tier-1 Tech roles.',
    sweetSpot: '8–12% in stable rounds; 14%+ only during a declared retention crisis (Round 4).',
  },
  salesAcc: {
    label: 'Sales Accelerator Multiplier',
    unit: 'x',
    display: (v: number) => `${v.toFixed(1)}x`,
    color: 'emerald',
    accentClass: 'accent-emerald-500',
    trackColor: '#10b981',
    whatItDoes: 'Multiplies commission rates for performance above 100% target. A 2x accelerator means a rep closing 130% earns double the unit rate on the incremental 30%.',
    tooHigh: 'Commission liability spikes. If three or more reps hit 140%+ target in the same quarter, payout exceeds budget by ₹15–20L.',
    tooLow: 'Below 1.5x has no behavioral effect — high-performers already model this. Quota plateau continues unresolved.',
    sweetSpot: '1.5x–2.5x creates meaningful differentiation. Above 2.5x only in Round 2 to break the plateau as a one-time signal.',
  },
  ltiMix: {
    label: 'Executive LTI Mix',
    unit: '%',
    display: (v: number) => `${Math.round(v * 100)}%`,
    color: 'amber',
    accentClass: 'accent-amber-500',
    trackColor: '#f59e0b',
    whatItDoes: 'Shifts executive variable pay from Short-Term Incentive (quarterly cash bonuses) toward Long-Term Incentives (ESOPs/RSUs vesting over 3–4 years). Directly counteracts the Agency Problem.',
    tooHigh: 'Executives feel cash-strapped in the current period. Risk of leadership attrition if LTI exceeds 55% without sufficient base pay foundation.',
    tooLow: 'Below 30% LTI, the Agency Problem persists. Executives continue optimizing quarterly EBITDA over 3-year IPO milestones.',
    sweetSpot: '30–45% in standard rounds. 45–50%+ in Rounds 5–6 to pass IPO governance screen.',
  },
  parityPool: {
    label: 'Equity Adjustment Pool',
    unit: '₹',
    display: (v: number) => `₹${(v / 100000).toFixed(1)}L`,
    color: 'violet',
    accentClass: 'accent-indigo-500',
    trackColor: '#8b5cf6',
    whatItDoes: 'A discretionary, targeted budget to correct specific pay fault lines identified in the parity audit — particularly across departments and city tiers. Not a blanket raise.',
    tooHigh: 'Absorbs budget headroom needed for crisis rounds. Board views large pool allocations without specific justification as fiscal imprecision.',
    tooLow: 'Insufficient to close statistical fault lines. p-value stays below 0.05, triggering compliance risk in DRHP filing.',
    sweetSpot: '₹3–5L in standard rounds. ₹5–8L in Round 3 (equity crisis) and Round 4 (Tier-3 international poaching).',
  },
};

export default function GameDashboard() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData, hydrated } = useGameStore();

  const [decisions, setDecisions] = useState({
    meritPool: 0.08,
    salesAcc: 1.0,
    ltiMix: 0.2,
    parityPool: 0,
  });

  const [activeTab, setActiveTab] = useState<'briefing' | 'workforce' | 'market' | 'execution'>('briefing');
  const [promotedEmployees, setPromotedEmployees] = useState<string[]>([]);
  const [interviewedIds, setInterviewedIds] = useState<string[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);
  const [selectedPulse, setSelectedPulse] = useState<{ name: string; role: string; quote: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeLeverInfo, setActiveLeverInfo] = useState<keyof typeof LEVER_CONFIG | null>(null);

  useEffect(() => {
    if (sessionData?.round) {
      setShowBriefing(true);
      setInterviewedIds([]);
      setPromotedEmployees([]);
      setSubmitted(false);
    }
  }, [sessionData?.round]);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionCode) { router.push('/'); return; }

    socket.connect();
    socket.emit('join_session', { sessionCode, role, playerName });

    socket.on('connect_error', (err) => {
      setErrorMessage(`Network Error: ${err.message}. Check your server URL settings.`);
    });
    socket.on('session_update', (data) => { setErrorMessage(null); updateSessionData(data); });
    socket.on('round_advanced', (data) => { updateSessionData(data); });
    socket.on('sudden_challenge', (shock) => {
      alert(`⚠️ MARKET SHOCK: ${shock.title}\n\n${shock.description}`);
    });

    return () => {
      socket.off('session_update');
      socket.off('round_advanced');
      socket.off('sudden_challenge');
    };
  }, [sessionCode, router, updateSessionData, role, playerName, hydrated]);

  const myId = socket.id as string;
  const myPlayer = sessionData?.players?.[myId];
  const currentMetrics = myPlayer?.metrics || {
    budgetUtil: 0.90, turnover: 0.05, engagement: 0.75, pValue: 0.08, roi: 0.65,
  };

  const round = sessionData?.round ?? 1;
  const roundStory = ROUND_STORIES[round as keyof typeof ROUND_STORIES];

  if (!sessionData) return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center bg-grid">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Synchronizing with War Room...</p>
        <p className="text-slate-700 text-[10px] mt-2">{sessionCode}</p>
      </div>
    </div>
  );

  const handleSubmit = () => {
    socket.emit('submit_decision', {
      sessionCode,
      decisions: { ...decisions, promotions: promotedEmployees },
    });
    setSubmitted(true);
  };

  const togglePromotion = (id: string) => {
    setPromotedEmployees(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) { alert('Board Alert: Promotion headcount quota reached this round (Max: 2).'); return prev; }
      return [...prev, id];
    });
  };

  const handleInterview = (emp: any) => {
    if (interviewedIds.includes(emp.id)) {
      const quote = EMPLOYEE_PULSE[round as keyof typeof EMPLOYEE_PULSE]?.[emp.id] || 'No further confidential information available at this clearance level.';
      setSelectedPulse({ name: emp.name, role: emp.role, quote });
      return;
    }
    if (interviewedIds.length >= 4) {
      alert('Executive Bandwidth Alert: Maximum 4 confidential interviews per round.');
      return;
    }
    setInterviewedIds(prev => [...prev, emp.id]);
    const quote = EMPLOYEE_PULSE[round as keyof typeof EMPLOYEE_PULSE]?.[emp.id] || 'This employee has no confidential feedback to surface this round.';
    setSelectedPulse({ name: emp.name, role: emp.role, quote });
  };

  // ──────────────────────────────────────────────────────────
  //  ROUND BRIEFING MODAL
  // ──────────────────────────────────────────────────────────
  const RoundBriefingModal = () => {
    if (!roundStory) return null;
    const isFirstRound = round === 1;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-4xl bg-[#0f1629] border border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden my-8">

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/0 border-b border-white/5 px-8 py-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.25em]">{roundStory.act}</span>
                <span className="text-slate-700">·</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.15em]">Round {round} of 6</span>
              </div>
              <h2 className="font-display text-3xl font-black italic text-white">
                {roundStory.title}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[9px] font-mono text-slate-600 uppercase">Human Equity Score</div>
              <div className="text-2xl font-black text-indigo-400">{myPlayer?.score || '—'}</div>
            </div>
          </div>

          <div className="p-8 space-y-6">

            {/* Situation Narrative */}
            <div className="bg-slate-950/60 border-l-4 border-indigo-500 rounded-r-2xl p-6">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Situation Briefing</div>
              <p className="prose-narrative text-sm leading-relaxed whitespace-pre-line">
                {roundStory.situation}
              </p>
            </div>

            {/* Your Mandate */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-amber-500" />
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{roundStory.mandate.headline}</div>
              </div>
              <div className="space-y-2.5">
                {roundStory.mandate.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-black text-amber-400">{i + 1}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{task}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch For + Board Pressure + Scoring Lens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Watch For */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <div className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em]">Watch For</div>
                </div>
                <div className="space-y-2">
                  {roundStory.watch_for.map((w, i) => (
                    <p key={i} className="text-[11px] text-slate-400 leading-relaxed border-l border-slate-700 pl-2">
                      {w}
                    </p>
                  ))}
                </div>
              </div>

              {/* Board Pressure */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Board Pressure</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{roundStory.board_pressure}</p>
              </div>

              {/* Scoring Lens */}
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-indigo-400" />
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Scoring Lens</div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{roundStory.scoring_lens}</p>
              </div>
            </div>

            {/* CFO Alert (if present) */}
            {roundStory.cfo_alert && (
              <div className="bg-rose-500/5 border border-rose-500/25 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider mb-1">CFO Budget Alert</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{roundStory.cfo_alert}</p>
                </div>
              </div>
            )}

            {/* Previous Round Results (rounds 2+) */}
            {round > 1 && myPlayer && (
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Previous Round Results</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'HES Score', value: myPlayer.score, unit: '/100', good: myPlayer.score >= 70 },
                    { label: 'Turnover Rate', value: `${(currentMetrics.turnover * 100).toFixed(1)}`, unit: '%', good: currentMetrics.turnover < 0.08 },
                    { label: 'Engagement', value: `${Math.round(currentMetrics.engagement * 100)}`, unit: '%', good: currentMetrics.engagement > 0.7 },
                    { label: 'Parity (p)', value: currentMetrics.pValue?.toFixed(3), unit: '', good: currentMetrics.pValue > 0.05 },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className={`text-2xl font-black ${m.good ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.value}<span className="text-sm">{m.unit}</span>
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={() => setShowBriefing(false)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/15 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-sm group"
            >
              Accept Briefing & Enter Command Center
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* Error Banner */}
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-rose-600 text-white p-2.5 text-center text-xs font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Round Briefing Modal */}
      {showBriefing && <RoundBriefingModal />}

      {/* 1-on-1 Pulse Modal */}
      {selectedPulse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-up">
          <div className="max-w-lg w-full bg-[#0f1629] border border-indigo-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.25em] mb-1">Confidential 1-on-1 Interview</div>
            <div className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-5">{selectedPulse.role}</div>
            <h2 className="font-display text-2xl font-black italic text-white mb-6">{selectedPulse.name}</h2>
            <div className="bg-slate-950/80 border-l-3 border-r-0 border-indigo-500 p-6 rounded-r-2xl mb-6" style={{ borderLeftWidth: '3px' }}>
              <p className="prose-narrative text-sm leading-relaxed italic text-indigo-100">
                "{selectedPulse.quote}"
              </p>
            </div>
            <button
              onClick={() => setSelectedPulse(null)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition text-xs"
            >
              End 1-on-1 Session
            </button>
          </div>
        </div>
      )}

      {/* Lever Info Drawer */}
      {activeLeverInfo && (
        <div className="fixed inset-0 z-[105] flex items-end justify-center p-4 bg-slate-950/70 backdrop-blur-sm" onClick={() => setActiveLeverInfo(null)}>
          <div className="w-full max-w-2xl bg-[#0f1629] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Decision Lever</div>
                <h3 className="text-lg font-black text-white">{LEVER_CONFIG[activeLeverInfo].label}</h3>
              </div>
              <button onClick={() => setActiveLeverInfo(null)} className="text-slate-600 hover:text-white text-xs font-mono">✕ Close</button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">What This Lever Does</div>
                <p className="text-xs text-slate-300 leading-relaxed">{LEVER_CONFIG[activeLeverInfo].whatItDoes}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                  <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">⬆ If Too High</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{LEVER_CONFIG[activeLeverInfo].tooHigh}</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">⬇ If Too Low</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{LEVER_CONFIG[activeLeverInfo].tooLow}</p>
                </div>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">◉ Recommended Range</div>
                <p className="text-[11px] text-slate-400">{LEVER_CONFIG[activeLeverInfo].sweetSpot}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP HEADER ─────────────────────────────────── */}
      <header className="border-b border-white/5 px-6 py-3 flex items-center justify-between bg-[#020817]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs font-black text-white tracking-wider">CompSim Pro</div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${submitted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {submitted ? 'Decision Submitted' : `Round ${round} · Awaiting Decision`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBriefing(true)}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition"
          >
            <FileText className="w-3.5 h-3.5" /> Round Brief
          </button>
          <div className="bg-slate-900 border border-white/5 rounded-lg px-3 py-1.5 text-right">
            <div className="text-[8px] font-mono text-slate-600 uppercase">HES Score</div>
            <div className="text-sm font-black text-indigo-400">{myPlayer?.score || '—'}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[9px] text-slate-600 font-mono">{playerName}</div>
            <div className="text-[9px] text-slate-700 font-mono">{sessionCode}</div>
          </div>
        </div>
      </header>

      {/* ── TAB NAVIGATION ─────────────────────────────── */}
      <nav className="max-w-7xl mx-auto flex bg-[#0a1020] border-b border-white/5 px-6">
        {([
          { id: 'briefing', label: 'Strategic Dossier', icon: FileText },
          { id: 'workforce', label: 'Workforce Hub', icon: Users },
          { id: 'market', label: 'Market Intel', icon: BarChart3 },
          { id: 'execution', label: 'Strategic Console', icon: Zap },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── MAIN CONTENT ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 min-h-[600px]">

        {/* ────────────────────────────────────────────────
            TAB 1: STRATEGIC DOSSIER
        ──────────────────────────────────────────────── */}
        {activeTab === 'briefing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-up">
            <div className="space-y-6 h-[720px] overflow-auto pr-2 scrollbar-hide">

              {/* Current Round Objective */}
              <section className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Current Objective · Round {round}</div>
                <h2 className="font-display text-xl font-black italic text-white mb-3">
                  {roundStory?.title || 'Stabilize the Cohort'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">{CASE_STUDY_BRIEFING.strategic_roadmap[round as keyof typeof CASE_STUDY_BRIEFING.strategic_roadmap]}</p>
              </section>

              {/* CEO Memo */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 opacity-4"><MessageSquare className="w-24 h-24 text-slate-700" /></div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Executive Communication</div>
                <h3 className="text-base font-black text-white mb-1">{NARRATIVE_DOSSIER.ceo_memo.title}</h3>
                <div className="text-[10px] font-mono text-slate-600 mb-4 uppercase tracking-wider">From: {NARRATIVE_DOSSIER.ceo_memo.author}</div>
                <p className="prose-narrative text-sm leading-relaxed whitespace-pre-line">{NARRATIVE_DOSSIER.ceo_memo.content}</p>
              </section>

              {/* Glossary */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-5">Executive Glossary</div>
                <div className="space-y-3">
                  {CASE_STUDY_BRIEFING.glossary.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-slate-800 hover:border-indigo-500/40 pl-3 py-1 transition-colors">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{item.term}</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6 h-[720px] overflow-auto pr-2 scrollbar-hide">
              {/* Board Intercept */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <div className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Confidential · Internal Intel</div>
                </div>
                <h3 className="text-base font-black text-white mb-1">{NARRATIVE_DOSSIER.board_intercept.title}</h3>
                <div className="text-[10px] font-mono text-slate-600 mb-4 uppercase tracking-wider">Source: {NARRATIVE_DOSSIER.board_intercept.author}</div>
                <p className="prose-narrative text-sm leading-relaxed whitespace-pre-line">{NARRATIVE_DOSSIER.board_intercept.content}</p>
              </section>

              {/* Strategic Roadmap */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-5">6-Quarter Strategic Roadmap</div>
                <div className="space-y-2">
                  {Object.entries(CASE_STUDY_BRIEFING.strategic_roadmap).map(([r, task]) => (
                    <div
                      key={r}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        Number(r) === round
                          ? 'bg-indigo-600/10 border border-indigo-500/20'
                          : Number(r) < round
                          ? 'opacity-35'
                          : 'opacity-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                        Number(r) === round
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : Number(r) < round
                          ? 'bg-slate-800 text-emerald-400'
                          : 'bg-slate-800 text-slate-600'
                      }`}>
                        {Number(r) < round ? '✓' : r}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug pt-0.5">{task}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Scoring Position */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Your Current Metrics</div>
                <div className="space-y-3">
                  {[
                    { label: 'Human Equity Score', value: myPlayer?.score || '—', unit: '/100', good: (myPlayer?.score || 0) >= 70, desc: 'Composite score' },
                    { label: 'Engagement Index', value: `${Math.round((currentMetrics.engagement || 0.75) * 100)}`, unit: '%', good: currentMetrics.engagement > 0.7, desc: '1 - Avg. Attrition Risk' },
                    { label: 'Pay Parity (p-value)', value: currentMetrics.pValue?.toFixed(3) || '0.082', unit: '', good: currentMetrics.pValue > 0.05, desc: '>0.05 = No fault line' },
                    { label: 'Budget Utilization', value: `${Math.round((currentMetrics.budgetUtil || 0.9) * 100)}`, unit: '%', good: currentMetrics.budgetUtil < 0.95, desc: 'Of merit budget' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">{m.label}</div>
                        <div className="text-[9px] text-slate-700 font-mono">{m.desc}</div>
                      </div>
                      <div className={`text-lg font-black font-mono ${m.good ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.value}<span className="text-xs">{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────
            TAB 2: WORKFORCE HUB
        ──────────────────────────────────────────────── */}
        {activeTab === 'workforce' && (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-fade-up">
            <div className="p-5 bg-slate-900/80 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/5">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-tight">Salary & Equity Audit</h2>
                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mt-0.5">
                  Live Employee Master File · Case: BharatQuick · Round {round} of 6
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2 text-center">
                  <div className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">1-on-1 Bandwidth</div>
                  <div className={`text-sm font-black ${interviewedIds.length >= 4 ? 'text-rose-500' : 'text-indigo-400'}`}>
                    {4 - interviewedIds.length} / 4 Left
                  </div>
                </div>
                <div className="bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2 text-center">
                  <div className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">Promotion Quota</div>
                  <div className={`text-sm font-black ${promotedEmployees.length >= 2 ? 'text-rose-500' : 'text-emerald-400'}`}>
                    {2 - promotedEmployees.length} / 2 Left
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 text-[9px] uppercase text-slate-600 font-black tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5">Employee / Role</th>
                    <th className="px-5 py-3.5">Grade</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5 text-center">Perf</th>
                    <th className="px-5 py-3.5">Current CTC</th>
                    <th className="px-5 py-3.5">Comp-Ratio</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(sessionData?.workforce || []).map((emp: any) => {
                    const cr = emp.currentPay / emp.marketMid;
                    const isGreenCircle = cr < 0.85;
                    const hasHadInterview = interviewedIds.includes(emp.id);

                    return (
                      <tr key={emp.id} className="border-b border-white/3 hover:bg-white/2 transition group">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-slate-200">{emp.name}</div>
                          <div className="text-[10px] text-slate-600 uppercase tracking-wider">{emp.role}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded">{emp.level}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-300">{emp.city}</div>
                          <div className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Tier {emp.tier}</div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            emp.performance >= 4
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : emp.performance >= 3
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {emp.performance}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-300">
                          ₹{(emp.currentPay / 100000).toFixed(1)}L
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-bold ${cr < 0.85 ? 'text-rose-400' : cr > 1.1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {cr.toFixed(2)}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cr < 0.85 ? 'bg-rose-500' : cr > 1.1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(cr * 90, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {isGreenCircle ? (
                            <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-1 rounded-full uppercase font-black risk-pulse">
                              ● Green Circle
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-full uppercase font-black">
                              ✓ Stable
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleInterview(emp)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight border transition ${
                                hasHadInterview
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : interviewedIds.length >= 4
                                  ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed'
                                  : 'text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10'
                              }`}
                            >
                              {hasHadInterview ? 'Reviewed' : '1-on-1'}
                            </button>
                            <button
                              onClick={() => togglePromotion(emp.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight border transition ${
                                promotedEmployees.includes(emp.id)
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : promotedEmployees.length >= 2
                                  ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed'
                                  : 'text-slate-400 border-slate-700 hover:border-indigo-500 hover:text-indigo-400'
                              }`}
                            >
                              {promotedEmployees.includes(emp.id) ? '✓ Promoted' : 'Promote'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950/30">
              <p className="text-[10px] text-slate-700 font-mono">
                Comp-Ratio Legend: <span className="text-rose-400">Red (&lt;0.85) = Green Circle · flight risk</span> · <span className="text-emerald-400">Green (0.85–1.10) = Market-aligned</span> · <span className="text-amber-400">Amber (&gt;1.10) = Above market</span>
              </p>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────
            TAB 3: MARKET INTEL
        ──────────────────────────────────────────────── */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-up">
            <div className="lg:col-span-2 space-y-6">
              {/* Geographic Benchmarks */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-black text-white uppercase tracking-tight">Geographic Market Benchmarks (P50)</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { tier: 'Tier 1 — Mumbai / Bengaluru', staff: '₹18–25L', sales: '₹12L + 2x Acc', exec: '₹60–90L LTI-heavy', heat: 'Critical' },
                    { tier: 'Tier 2 — Pune / Hyderabad', staff: '₹12–18L', sales: '₹8L + 1.5x Acc', exec: '₹45–60L', heat: 'High' },
                    { tier: 'Tier 3 — Jaipur / Kochi', staff: '₹6–10L', sales: '₹5L + 1x Acc', exec: '₹30–40L', heat: 'Moderate' },
                    { tier: 'Tier 4 — Mysore / Indore', staff: '₹4–7L', sales: '₹4L + flat commission', exec: '₹20–30L', heat: 'Moderate' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-slate-950/40 rounded-xl border border-white/4 hover:border-indigo-500/20 transition-colors group">
                      <div className="flex items-center gap-3 mb-2 md:mb-0">
                        <div className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                          item.heat === 'Critical' ? 'bg-rose-500/15 text-rose-400'
                          : item.heat === 'High' ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-800 text-slate-500'
                        }`}>{item.heat}</div>
                        <span className="font-bold text-sm text-slate-200">{item.tier}</span>
                      </div>
                      <div className="flex gap-6 text-[11px] font-mono">
                        <span className="text-slate-600">Staff: <b className="text-indigo-400">{item.staff}</b></span>
                        <span className="text-slate-600">Sales: <b className="text-emerald-400">{item.sales}</b></span>
                        <span className="text-slate-600">Exec: <b className="text-amber-400">{item.exec}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Market Intel Feed */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Intelligence Hub</div>
                <h3 className="text-base font-black text-white mb-1">{NARRATIVE_DOSSIER.market_gossip.title}</h3>
                <p className="prose-narrative text-sm leading-relaxed whitespace-pre-line mt-4">{NARRATIVE_DOSSIER.market_gossip.content}</p>
              </section>
            </div>

            {/* Right: Volatility Cards */}
            <div className="space-y-4">
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white uppercase mb-5">Market Volatility Index</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Critical — Tech Metros</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Bengaluru Tech talent demanding LTI-primary packages. Retention cost expected +18% YoY.</p>
                  </div>
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wider">High — International Drain</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">UAE expat offers targeting Tier-3 talent with 2.2x effective purchasing power advantage.</p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Opportunity — Geo Arbitrage</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Tier-3 employees outperforming on per-rupee productivity by 34%. Strong ROI case for targeted investment.</p>
                  </div>
                </div>
              </section>

              {/* Competitor Activity */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Competitor Moves</h3>
                <div className="space-y-3 text-[11px]">
                  {[
                    { co: 'DunzoScale', action: 'Launched 2.5x Sales Accelerator for account managers' },
                    { co: 'Zepto', action: 'Offering 25% LTI in senior tech CTC packages' },
                    { co: 'UAE Fintechs', action: 'Active Tier-3 India pipeline with relocation + tax-free AED' },
                  ].map(c => (
                    <div key={c.co} className="flex items-start gap-2.5 border-b border-white/4 pb-3 last:border-0 last:pb-0">
                      <span className="w-2 h-2 rounded-full bg-rose-500/60 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-white">{c.co}</span>
                        <span className="text-slate-500"> — {c.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────
            TAB 4: STRATEGIC CONSOLE
        ──────────────────────────────────────────────── */}
        {activeTab === 'execution' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-up">

            {/* LEFT: LEVERS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-white uppercase tracking-tight">Decision Levers</h2>
                <div className="text-[10px] text-slate-600 font-mono">Round {round} of 6 · {roundStory?.act}</div>
              </div>

              {/* Round Mandate Reminder */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-2">
                <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Scoring Focus This Round</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{roundStory?.scoring_lens}</p>
              </div>

              {/* LEVER: Merit Pool */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{LEVER_CONFIG.meritPool.label}</div>
                    <button onClick={() => setActiveLeverInfo('meritPool')} className="text-slate-700 hover:text-indigo-400 transition">
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {LEVER_CONFIG.meritPool.display(decisions.meritPool)}
                  </div>
                </div>
                <input
                  type="range" min="0" max="0.30" step="0.01"
                  value={decisions.meritPool}
                  onChange={(e) => setDecisions({ ...decisions, meritPool: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 mb-3"
                  style={{ background: `linear-gradient(90deg, #6366f1 ${(decisions.meritPool / 0.30) * 100}%, #1e293b ${(decisions.meritPool / 0.30) * 100}%)` }}
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-700">
                  <span>0% (No Change)</span>
                  <span>30% (Crisis Mode)</span>
                </div>
                {decisions.meritPool > 0.15 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> Above 15% — CFO review likely triggered
                  </div>
                )}
              </div>

              {/* LEVER: Sales Accelerator */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{LEVER_CONFIG.salesAcc.label}</div>
                    <button onClick={() => setActiveLeverInfo('salesAcc')} className="text-slate-700 hover:text-indigo-400 transition">
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {LEVER_CONFIG.salesAcc.display(decisions.salesAcc)}
                  </div>
                </div>
                <input
                  type="range" min="1.0" max="3.0" step="0.1"
                  value={decisions.salesAcc}
                  onChange={(e) => setDecisions({ ...decisions, salesAcc: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 mb-3"
                  style={{ background: `linear-gradient(90deg, #10b981 ${((decisions.salesAcc - 1) / 2) * 100}%, #1e293b ${((decisions.salesAcc - 1) / 2) * 100}%)` }}
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-700">
                  <span>1.0x (Linear / Status Quo)</span>
                  <span>3.0x (Market Edge)</span>
                </div>
                {decisions.salesAcc < 1.5 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400">
                    <AlertTriangle className="w-3 h-3" /> Below behavioral threshold — quota plateau likely continues
                  </div>
                )}
              </div>

              {/* LEVER: LTI Mix */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{LEVER_CONFIG.ltiMix.label}</div>
                    <button onClick={() => setActiveLeverInfo('ltiMix')} className="text-slate-700 hover:text-indigo-400 transition">
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {LEVER_CONFIG.ltiMix.display(decisions.ltiMix)}
                  </div>
                </div>
                <input
                  type="range" min="0" max="0.60" step="0.05"
                  value={decisions.ltiMix}
                  onChange={(e) => setDecisions({ ...decisions, ltiMix: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 mb-3"
                  style={{ background: `linear-gradient(90deg, #f59e0b ${(decisions.ltiMix / 0.60) * 100}%, #1e293b ${(decisions.ltiMix / 0.60) * 100}%)` }}
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-700">
                  <span>0% (Full Cash)</span>
                  <span>60% (IPO Alignment)</span>
                </div>
                {round >= 5 && decisions.ltiMix < 0.35 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> Below IPO governance threshold — will be flagged in DRHP
                  </div>
                )}
              </div>

              {/* LEVER: Equity Pool */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{LEVER_CONFIG.parityPool.label}</div>
                    <button onClick={() => setActiveLeverInfo('parityPool')} className="text-slate-700 hover:text-indigo-400 transition">
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-violet-400 font-mono">
                    {LEVER_CONFIG.parityPool.display(decisions.parityPool)}
                  </div>
                </div>
                <input
                  type="range" min="0" max="1000000" step="50000"
                  value={decisions.parityPool}
                  onChange={(e) => setDecisions({ ...decisions, parityPool: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500 mb-3"
                  style={{ background: `linear-gradient(90deg, #8b5cf6 ${(decisions.parityPool / 1000000) * 100}%, #1e293b ${(decisions.parityPool / 1000000) * 100}%)` }}
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-700">
                  <span>₹0 (No Intervention)</span>
                  <span>₹10L (Emergency Pool)</span>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY + SUBMIT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-white uppercase tracking-tight">Decision Summary</h2>
                <div className={`text-[10px] font-mono px-2 py-1 rounded-full uppercase ${submitted ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
                  {submitted ? '✓ Submitted' : '● Pending'}
                </div>
              </div>

              {/* Metrics Preview */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-5">Current Scorecard</div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'HES Score', value: myPlayer?.score || '78', unit: '', color: 'text-indigo-400', bar: myPlayer?.score || 78 },
                    { label: 'Engagement', value: `${Math.round((currentMetrics.engagement || 0.75) * 100)}`, unit: '%', color: 'text-emerald-400', bar: Math.round((currentMetrics.engagement || 0.75) * 100) },
                    { label: 'Parity (p)', value: currentMetrics.pValue?.toFixed(3) || '0.082', unit: '', color: currentMetrics.pValue > 0.05 ? 'text-emerald-400' : 'text-rose-400', bar: null },
                    { label: 'Budget Used', value: `${Math.round((currentMetrics.budgetUtil || 0.9) * 100)}`, unit: '%', color: (currentMetrics.budgetUtil || 0) > 0.95 ? 'text-rose-400' : 'text-slate-300', bar: null },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-950/40 rounded-xl p-4 border border-white/3 text-center">
                      {m.bar !== null && (
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.bar}%` }} />
                        </div>
                      )}
                      <div className={`text-xl font-black font-mono ${m.color}`}>{m.value}<span className="text-xs">{m.unit}</span></div>
                      <div className="text-[9px] text-slate-600 uppercase tracking-wider mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Promotions Summary */}
              <section className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Promotions Nominated</div>
                  <div className="text-xs font-black text-white">{promotedEmployees.length} / 2</div>
                </div>
                {promotedEmployees.length === 0 ? (
                  <p className="text-[11px] text-slate-700 italic">No promotions nominated this round. Review Workforce Hub.</p>
                ) : (
                  <div className="space-y-2">
                    {(sessionData?.workforce || [])
                      .filter((e: any) => promotedEmployees.includes(e.id))
                      .map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                          <div>
                            <div className="text-xs font-bold text-white">{e.name}</div>
                            <div className="text-[9px] text-slate-600">{e.role} · +15% CTC</div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      ))}
                  </div>
                )}
              </section>

              {/* Leadership Advisory */}
              <div className="bg-indigo-900/10 border border-indigo-500/15 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Strategic Advisory</span>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  "Success in this simulation is not about finding a single 'right' number. It is about balancing the competing interests of individual stars, collective fairness, and corporate sustainability — simultaneously, under real constraints."
                </p>
                <div className="text-[9px] text-slate-700 mt-2 font-mono">— CHRO Ananya Mehta, Pre-Simulation Briefing</div>
              </div>

              {/* SUBMIT BUTTON */}
              {submitted ? (
                <div className="w-full py-5 bg-emerald-600/15 border border-emerald-600/30 text-emerald-400 font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Strategic Plan Deployed to HQ
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  id="authorize-decisions-btn"
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/15 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-sm group"
                >
                  Authorize Round {round} Decisions
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <p className="text-[10px] text-slate-700 text-center font-mono">
                Decisions are final once authorized. The professor may advance to the next round after all teams submit.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/4 px-8 py-3 flex justify-between text-[9px] font-mono text-slate-800 uppercase tracking-widest">
        <div>BharatQuick Simulation · CompSim Pro v3.0 · MBA Total Rewards</div>
        <div>© 2026 CompSim Pro Systems · All decisions are simulated</div>
      </footer>
    </div>
  );
}
