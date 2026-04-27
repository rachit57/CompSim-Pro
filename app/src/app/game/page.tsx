"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import {
  ONBOARDING_CONTENT,
  ROUND_STORIES,
  EMPLOYEE_PULSE,
  NARRATIVE_DOSSIER,
  CASE_STUDY_BRIEFING,
  type OnboardingSlide,
  type RoundStory,
} from '@/lib/narrative';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  BarChart2,
  Users,
  TrendingUp,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

// ── TYPES ───────────────────────────────────────────────────────────────────

type GameTab = 'situation' | 'workforce' | 'market' | 'decisions';

type Phase =
  | { type: 'onboarding'; slide: number }
  | { type: 'round-brief' }
  | { type: 'playing'; tab: GameTab }
  | { type: 'end' };

interface Decisions {
  meritPool: number;
  salesAcc: number;
  ltiMix: number;
  parityPool: number;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────

const DEFAULT_DECISIONS: Decisions = {
  meritPool: 0.08,
  salesAcc: 1.0,
  ltiMix: 0.2,
  parityPool: 0,
};

const fmtLPA  = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
const fmtPct  = (n: number) => `${Math.round(n * 100)}%`;
const fmtCR   = (pay: number, mid: number) => (pay / mid).toFixed(2);

const sliderBg = (frac: number) =>
  `linear-gradient(to right, #4f46e5 ${frac * 100}%, rgba(255,255,255,0.07) ${frac * 100}%)`;

// ════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════

export default function GamePage() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData, hydrated } =
    useGameStore();

  const [phase,       setPhase]       = useState<Phase>({ type: 'onboarding', slide: 0 });
  const [decisions,   setDecisions]   = useState<Decisions>(DEFAULT_DECISIONS);
  const [promoted,    setPromoted]    = useState<string[]>([]);
  const [interviewed, setInterviewed] = useState<string[]>([]);
  const [submitted,   setSubmitted]   = useState(false);
  const [pulse, setPulse] = useState<{ name: string; role: string; quote: string } | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();

  // ── SOCKET SETUP ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionCode) { router.push('/'); return; }

    socket.connect();
    socket.emit('join_session', { sessionCode, role, playerName });

    socket.on('connect_error', (err) =>
      setErrMsg(`Connection error: ${err.message}`),
    );

    socket.on('session_update', (data) => {
      setErrMsg(null);
      updateSessionData(data);
    });

    // Professor advances: only interrupt if already playing
    socket.on('round_advanced', (data) => {
      updateSessionData(data);
      setPhase((prev) =>
        prev.type === 'playing' ? { type: 'round-brief' } : prev,
      );
      setDecisions(DEFAULT_DECISIONS);
      setPromoted([]);
      setInterviewed([]);
      setSubmitted(false);
    });

    socket.on('sudden_challenge', (shock) => {
      alert(`Market Shock: ${shock.title}\n\n${shock.description}`);
    });

    return () => {
      socket.off('connect_error');
      socket.off('session_update');
      socket.off('round_advanced');
      socket.off('sudden_challenge');
    };
  }, [hydrated, sessionCode, role, playerName, router, updateSessionData]);

  // ── LOADING ───────────────────────────────────────────────────────────────

  if (!hydrated || !sessionData) {
    return (
      <div className="min-h-screen bg-[#050a18] flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Connecting to session…</p>
        </div>
      </div>
    );
  }

  const round: number   = sessionData.round ?? 1;
  const myId            = socket.id as string;
  const myPlayer        = sessionData.players?.[myId];
  const metrics         = myPlayer?.metrics ?? {
    budgetUtil: 0, turnover: 0.08, engagement: 0.75, pValue: 0.082, roi: 0,
  };
  const workforce: any[] = sessionData.workforce ?? [];

  // ── SUBMIT ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    socket.emit('submit_decision', {
      sessionCode,
      decisions: { ...decisions, promotions: promoted, round },
    });
    setSubmitted(true);
    
    // Auto advance local state
    if (round < 6) {
      setPhase({ type: 'round-brief' }); 
      setDecisions(DEFAULT_DECISIONS);
      setPromoted([]);
      setInterviewed([]);
      setSubmitted(false);
      // Bump round locally so the next brief matches the upcoming round state
      updateSessionData({
        ...sessionData,
        round: round + 1
      });
    } else {
      setTimeout(() => setPhase({ type: 'end' }), 1400);
    }
  };

  // ── HELPERS ───────────────────────────────────────────────────────────────

  const togglePromote = (id: string) =>
    setPromoted((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2)  return prev;
      return [...prev, id];
    });

  const handleInterview = (emp: any) => {
    const alreadyDone = interviewed.includes(emp.id);
    const quote =
      EMPLOYEE_PULSE[round]?.[emp.id] ??
      'No additional disclosure this quarter.';
    if (!alreadyDone) {
      if (interviewed.length >= 4) return;
      setInterviewed((prev) => [...prev, emp.id]);
    }
    // Look up name/role from workforce data
    setPulse({ name: emp.name, role: emp.role, quote });
  };

  // ════════════════════════════════════════════════════════════════════════
  //  PHASE: ONBOARDING
  // ════════════════════════════════════════════════════════════════════════

  if (phase.type === 'onboarding') {
    const { slide: idx } = phase;
    const total = ONBOARDING_CONTENT.length + 1; // +1 = round brief

    const goNext = () =>
      idx < ONBOARDING_CONTENT.length - 1
        ? setPhase({ type: 'onboarding', slide: idx + 1 })
        : setPhase({ type: 'round-brief' });

    const goBack =
      idx > 0 ? () => setPhase({ type: 'onboarding', slide: idx - 1 }) : undefined;

    return (
      <OnboardingScreen
        slide={ONBOARDING_CONTENT[idx]}
        slideIdx={idx}
        total={total}
        onNext={goNext}
        onBack={goBack}
        isLast={idx === ONBOARDING_CONTENT.length - 1}
        playerName={playerName ?? ''}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PHASE: ROUND BRIEF
  // ════════════════════════════════════════════════════════════════════════

  if (phase.type === 'round-brief') {
    return (
      <RoundBriefScreen
        story={ROUND_STORIES[round]}
        round={round}
        playerName={playerName ?? ''}
        prevScore={myPlayer?.score ?? null}
        onEnter={() => setPhase({ type: 'playing', tab: 'situation' })}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PHASE: END
  // ════════════════════════════════════════════════════════════════════════

  if (phase.type === 'end') {
    return (
      <EndScreen
        playerName={playerName ?? ''}
        score={myPlayer?.score ?? 0}
        metrics={metrics}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  PHASE: PLAYING - GAME DASHBOARD
  // ════════════════════════════════════════════════════════════════════════

  const tab    = phase.tab;
  const setTab = (t: GameTab) => setPhase({ type: 'playing', tab: t });

  const TABS = [
    { id: 'situation' as GameTab, label: 'Situation',   Icon: BarChart2   },
    { id: 'workforce' as GameTab, label: 'Workforce',   Icon: Users       },
    { id: 'market'    as GameTab, label: 'Market Data', Icon: TrendingUp  },
    { id: 'decisions' as GameTab, label: 'Decisions',   Icon: Sliders     },
  ];

  return (
    <div className="min-h-screen bg-[#050a18] text-[var(--text)] flex flex-col">

      {/* Error banner */}
      {errMsg && (
        <div className="bg-red-950/80 text-red-300 text-xs px-4 py-2 text-center border-b border-red-900">
          {errMsg}
        </div>
      )}

      {/* Top header */}
      <header className="flex-none h-12 border-b border-[var(--border)] px-6 flex items-center justify-between bg-[#050a18]/95 sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-[var(--text)]">BharatQuick</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[11px] text-[var(--text-muted)]">CompSim Pro</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setPhase({ type: 'round-brief' })}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Round {round} Brief
          </button>
          
          <button
            onClick={toggleTheme}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="text-right">
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">HES</div>
            <div className="text-[13px] font-semibold font-mono text-[var(--accent)]">
              {myPlayer?.score ?? '-'}
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-[var(--text-muted)]">{playerName}</div>
            <div className="text-[9px] text-[var(--text-muted)] font-mono">{sessionCode}</div>
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              submitted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-[10px] text-[var(--text-muted)]">
            {submitted
              ? 'Decisions submitted - awaiting next round'
              : `Round ${round} of 6 · Decisions pending`}
          </span>
        </div>
        <div className="hidden sm:flex gap-5 text-[10px] font-mono text-[var(--text-muted)]">
          <span>
            Engagement:&nbsp;
            <span className={metrics.engagement > 0.7 ? 'text-emerald-600' : 'text-red-500'}>
              {fmtPct(metrics.engagement)}
            </span>
          </span>
          <span>
            Turnover:&nbsp;
            <span className={metrics.turnover < 0.08 ? 'text-emerald-600' : 'text-red-500'}>
              {fmtPct(metrics.turnover)}
            </span>
          </span>
          <span>
            Parity p:&nbsp;
            <span className={metrics.pValue > 0.05 ? 'text-emerald-600' : 'text-red-500'}>
              {metrics.pValue?.toFixed(3) ?? '-'}
            </span>
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <nav className="border-b border-[var(--border)] px-6 flex bg-[var(--surface-alt)]">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-3.5 text-[12px] font-medium border-b-2 transition-all ${
              tab === id
                ? 'border-indigo-500 text-[var(--text)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-muted)]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* ── SITUATION ─────────────────────────────────────────────────── */}
        {tab === 'situation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">

            {/* Current round story */}
            <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-1">
                Current Situation · Round {round} of 6
              </p>
              <h2 className="font-display text-xl font-bold italic text-[var(--text)] mb-5">
                {ROUND_STORIES[round]?.title}
              </h2>
              <div className="prose-sim space-y-4">
                {ROUND_STORIES[round]?.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              {/* CEO Memo */}
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-1">
                  Executive Communication
                </p>
                <h3 className="text-[13px] font-semibold text-[var(--text)] mb-1">
                  {NARRATIVE_DOSSIER.ceo_memo.title}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mb-4">
                  {NARRATIVE_DOSSIER.ceo_memo.author}
                </p>
                <div className="prose-sim space-y-3">
                  {NARRATIVE_DOSSIER.ceo_memo.content.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>

              {/* Strategic Roadmap */}
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-4">
                  Strategic Roadmap
                </p>
                <div className="space-y-1.5">
                  {Object.entries(CASE_STUDY_BRIEFING.strategic_roadmap).map(([r, desc]) => {
                    const n = Number(r);
                    return (
                      <div
                        key={r}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          n === round ? 'bg-indigo-600/10 border border-indigo-600/15' : ''
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-semibold mt-0.5 ${
                            n < round
                              ? 'bg-emerald-700/25 text-emerald-500'
                              : n === round
                              ? 'bg-indigo-600 text-[var(--text)]'
                              : 'bg-slate-800 text-[var(--text-muted)]'
                          }`}
                        >
                          {n < round ? '✓' : r}
                        </div>
                        <p className={`text-[11px] leading-snug ${
                          n === round ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                        }`}>
                          {desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── WORKFORCE ─────────────────────────────────────────────────── */}
        {tab === 'workforce' && (
          <div className="animate-in">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[13px] font-semibold text-[var(--text)]">Workforce Master File</h2>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    BharatQuick · {workforce.length} employees · Round {round}
                  </p>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-[var(--text-muted)] text-right shrink-0">
                  <span>Interviews: {4 - interviewed.length} / 4 left</span>
                  <span>Promotions: {2 - promoted.length} / 2 left</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Employee</th>
                      <th className="text-left px-4 py-3">Grade</th>
                      <th className="text-left px-4 py-3">City · Tier</th>
                      <th className="text-center px-4 py-3">Perf</th>
                      <th className="text-right px-4 py-3">CTC</th>
                      <th className="text-right px-4 py-3">Comp-Ratio</th>
                      <th className="text-center px-4 py-3">Flag</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {workforce.map((emp: any) => {
                      const cr           = emp.currentPay / emp.marketMid;
                      const isRisk       = cr < 0.85;
                      const wasInterviewed = interviewed.includes(emp.id);
                      const isPromoted   = promoted.includes(emp.id);

                      return (
                        <tr key={emp.id} className="hover:bg-[var(--surface-alt)] transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="text-[13px] font-medium text-[var(--text)]">{emp.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{emp.role}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-slate-800/50 px-2 py-0.5 rounded">
                              {emp.level}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-[12px] text-[var(--text-muted)]">{emp.city}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Tier {emp.tier}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`text-[12px] font-semibold font-mono ${
                              emp.performance >= 4
                                ? 'text-emerald-400'
                                : emp.performance >= 3
                                ? 'text-[var(--text-muted)]'
                                : 'text-red-400'
                            }`}>
                              {emp.performance}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] text-[var(--text)]">
                            {fmtLPA(emp.currentPay)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isRisk ? 'bg-red-500' : cr > 1.1 ? 'bg-amber-500' : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${Math.min(cr * 88, 100)}%` }}
                                />
                              </div>
                              <span className={`text-[11px] font-mono font-medium ${
                                isRisk ? 'text-red-400' : cr > 1.1 ? 'text-amber-400' : 'text-[var(--text-muted)]'
                              }`}>
                                {fmtCR(emp.currentPay, emp.marketMid)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isRisk
                              ? <span className="text-[9px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Risk</span>
                              : <span className="text-[9px] font-medium text-[var(--text-muted)] bg-slate-800/60 px-2 py-0.5 rounded-full">Stable</span>
                            }
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex justify-end gap-2">
                              <button
                                id={`interview-${emp.id}`}
                                onClick={() => handleInterview(emp)}
                                disabled={!wasInterviewed && interviewed.length >= 4}
                                className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                                  wasInterviewed
                                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/25'
                                    : interviewed.length >= 4
                                    ? 'text-[var(--text-muted)] cursor-not-allowed'
                                    : 'text-[var(--text-muted)] border border-[var(--border)] hover:border-indigo-600/40 hover:text-indigo-400'
                                }`}
                              >
                                {wasInterviewed ? 'Reviewed' : '1-on-1'}
                              </button>
                              <button
                                id={`promote-${emp.id}`}
                                onClick={() => togglePromote(emp.id)}
                                disabled={!isPromoted && promoted.length >= 2}
                                className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                                  isPromoted
                                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-600/25'
                                    : promoted.length >= 2
                                    ? 'text-[var(--text-muted)] cursor-not-allowed'
                                    : 'text-[var(--text-muted)] border border-[var(--border)] hover:border-emerald-600/40 hover:text-emerald-400'
                                }`}
                              >
                                {isPromoted ? '✓ Promoted' : 'Promote'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-2.5 border-t border-[var(--border)] bg-[var(--surface-alt)]">
                <p className="text-[9px] text-[var(--text-muted)] font-mono">
                  Comp-Ratio: &lt;0.85 = Risk · 0.85–1.10 = Market · &gt;1.10 = Above market
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── MARKET DATA ───────────────────────────────────────────────── */}
        {tab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in">
            <div className="lg:col-span-2 space-y-6">

              {/* Salary benchmarks */}
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-5">
                  Salary Benchmarks · P50 Market Median
                </p>
                <div className="divide-y divide-white/[0.04]">
                  {[
                    { tier: 'Tier 1 - Mumbai / Bengaluru',   staff: '₹18–25L', sales: '₹12L + variable', exec: '₹60–90L' },
                    { tier: 'Tier 2 - Pune / Hyderabad',     staff: '₹12–18L', sales: '₹8L + variable',  exec: '₹45–60L' },
                    { tier: 'Tier 3 - Jaipur / Kochi',       staff: '₹6–10L',  sales: '₹5L + variable',  exec: '₹30–40L' },
                    { tier: 'Tier 4 - Mysore / Indore',      staff: '₹4–7L',   sales: '₹4L + commission',exec: '₹20–30L' },
                  ].map((row, i) => (
                    <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-[12px] font-medium text-[var(--text)]">{row.tier}</span>
                      <div className="flex gap-4 text-[11px] font-mono text-[var(--text-muted)]">
                        <span>Staff: <b className="text-[var(--text-muted)]">{row.staff}</b></span>
                        <span>Sales: <b className="text-[var(--text-muted)]">{row.sales}</b></span>
                        <span>Exec:  <b className="text-[var(--text-muted)]">{row.exec}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Board intercept */}
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-1">
                  Board Intercept - Confidential
                </p>
                <h3 className="text-[13px] font-semibold text-[var(--text)] mb-4">
                  {NARRATIVE_DOSSIER.board_intercept.title}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mb-4">
                  {NARRATIVE_DOSSIER.board_intercept.author}
                </p>
                <div className="prose-sim space-y-3">
                  {NARRATIVE_DOSSIER.board_intercept.content.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            </div>

            {/* Market signals sidebar */}
            <div>
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-5">
                  Market Signals
                </p>
                <div className="space-y-5">
                  {[
                    {
                      label:  'Bengaluru Tech',
                      level:  'Critical',
                      note:   'Tier-1 engineering talent now treats LTI as a primary decision factor. Firms without meaningful equity upside are being screened out at offer stage.',
                    },
                    {
                      label:  'Sales Sector',
                      level:  'High',
                      note:   'Competitor DunzoScale launched a 2.5x accelerator last month. Three BharatQuick AMs have since accepted recruiter calls.',
                    },
                    {
                      label:  'International Drain',
                      level:  'High',
                      note:   'Spike in Tier-2 and Tier-3 managers receiving UAE expat packages. Effective purchasing-power gap estimated at 2.2× versus INR fixed salary.',
                    },
                    {
                      label:  'Tier-3 Productivity',
                      level:  'Opportunity',
                      note:   'Tier-3 employees outperform Tier-1 counterparts on per-rupee productivity by an estimated 34%. Retention ROI is strong at this band.',
                    },
                  ].map((s, i) => (
                    <div key={i} className="border-l-2 border-[var(--border)] pl-3.5">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[12px] font-medium text-[var(--text)]">{s.label}</span>
                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                          s.level === 'Critical'    ? 'text-red-500'
                          : s.level === 'High'      ? 'text-amber-500'
                          : 'text-emerald-500'
                        }`}>
                          {s.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{s.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── DECISIONS ─────────────────────────────────────────────────── */}
        {tab === 'decisions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">

            {/* Levers */}
            <div className="space-y-5">
              <h2 className="text-[13px] font-semibold text-[var(--text)]">Decision Levers</h2>

              {/* Merit Pool */}
              <LeverCard
                id="lever-merit"
                label="Merit Pool"
                description="Percentage salary increase applied across all employees, weighted by performance rating"
                displayValue={fmtPct(decisions.meritPool)}
              >
                <input
                  id="slider-merit"
                  type="range" min={0} max={0.3} step={0.01}
                  value={decisions.meritPool}
                  onChange={(e) => setDecisions((d) => ({ ...d, meritPool: +e.target.value }))}
                  style={{ background: sliderBg(decisions.meritPool / 0.3) }}
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
                  <span>0%</span><span>30%</span>
                </div>
              </LeverCard>

              {/* Sales Accelerator */}
              <LeverCard
                id="lever-sales"
                label="Sales Accelerator"
                description="Commission rate multiplier that activates above 100% of quarterly sales target"
                displayValue={`${decisions.salesAcc.toFixed(1)}×`}
              >
                <input
                  id="slider-sales"
                  type="range" min={1.0} max={3.0} step={0.1}
                  value={decisions.salesAcc}
                  onChange={(e) => setDecisions((d) => ({ ...d, salesAcc: +e.target.value }))}
                  style={{ background: sliderBg((decisions.salesAcc - 1) / 2) }}
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
                  <span>1.0× (Linear)</span><span>3.0×</span>
                </div>
              </LeverCard>

              {/* Executive LTI Mix */}
              <LeverCard
                id="lever-lti"
                label="Executive LTI Mix"
                description="Proportion of executive variable pay allocated as long-term equity rather than immediate cash"
                displayValue={fmtPct(decisions.ltiMix)}
              >
                <input
                  id="slider-lti"
                  type="range" min={0} max={0.6} step={0.05}
                  value={decisions.ltiMix}
                  onChange={(e) => setDecisions((d) => ({ ...d, ltiMix: +e.target.value }))}
                  style={{ background: sliderBg(decisions.ltiMix / 0.6) }}
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
                  <span>0% (Full cash)</span><span>60%</span>
                </div>
              </LeverCard>

              {/* Equity Adjustment Pool */}
              <LeverCard
                id="lever-equity"
                label="Equity Adjustment Pool"
                description="Discretionary budget directed at specific pay anomalies in the workforce"
                displayValue={fmtLPA(decisions.parityPool)}
              >
                <input
                  id="slider-equity"
                  type="range" min={0} max={1000000} step={50000}
                  value={decisions.parityPool}
                  onChange={(e) => setDecisions((d) => ({ ...d, parityPool: +e.target.value }))}
                  style={{ background: sliderBg(decisions.parityPool / 1000000) }}
                />
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] mt-1">
                  <span>₹0</span><span>₹10L</span>
                </div>
              </LeverCard>
            </div>

            {/* Submission summary */}
            <div className="space-y-5">
              <h2 className="text-[13px] font-semibold text-[var(--text)]">Submission Summary</h2>

              {/* Metrics */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 grid grid-cols-2 gap-3">
                {[
                  { l: 'HES Score',    v: myPlayer?.score ?? '-',    good: (myPlayer?.score ?? 0) >= 65 },
                  { l: 'Engagement',   v: fmtPct(metrics.engagement), good: metrics.engagement > 0.7    },
                  { l: 'Parity p',     v: metrics.pValue?.toFixed(3) ?? '-', good: metrics.pValue > 0.05 },
                  { l: 'Turnover',     v: fmtPct(metrics.turnover),   good: metrics.turnover < 0.08     },
                ].map((m) => (
                  <div key={m.l} className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg p-3 text-center">
                    <div className={`text-xl font-bold font-mono ${m.good ? 'text-[var(--text)]' : 'text-red-400'}`}>
                      {m.v}
                    </div>
                    <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{m.l}</div>
                  </div>
                ))}
              </div>

              {/* Promotions */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.15em]">
                    Promotions Nominated
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{promoted.length} / 2</span>
                </div>
                {promoted.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    None - use the Workforce tab to nominate employees.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {workforce
                      .filter((e: any) => promoted.includes(e.id))
                      .map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between text-[12px]">
                          <div>
                            <span className="font-medium text-[var(--text)]">{e.name}</span>
                            <span className="text-[var(--text-muted)] ml-2 text-[10px]">{e.level} → +15% CTC</span>
                          </div>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              {submitted ? (
                <div className="w-full py-4 bg-emerald-700/10 border border-emerald-700/20 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-[13px] font-medium">
                  <Check className="w-4 h-4" />
                  Decisions Submitted
                </div>
              ) : (
                <button
                  id="submit-decisions-btn"
                  onClick={handleSubmit}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-[var(--text)] text-[13px] font-medium rounded-xl transition-colors flex items-center justify-center gap-2 group"
                >
                  Submit Round {round} Decisions
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <p className="text-[10px] text-[var(--text-muted)] text-center">
                Decisions are final once submitted. The professor advances the round.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 1-on-1 Pulse Modal */}
      {pulse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => setPulse(null)}
        >
          <div
            className="w-full max-w-md bg-[var(--surface-alt)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-1">
              Confidential 1-on-1
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mb-5">{pulse.role}</p>
            <h3 className="font-display text-2xl font-bold italic text-[var(--text)] mb-6">{pulse.name}</h3>
            <div className="border-l-2 border-[var(--border)] pl-5 mb-7">
              <p className="prose-sim italic">"{pulse.quote}"</p>
            </div>
            <button
              onClick={() => setPulse(null)}
              className="w-full py-2.5 text-[12px] text-[var(--text-muted)] border border-[var(--border)] rounded-lg hover:border-[var(--border)] hover:text-[var(--text)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  LEVER CARD - reusable decision control
// ════════════════════════════════════════════════════════════════════════════

function LeverCard({
  id, label, description, displayValue, children,
}: {
  id: string;
  label: string;
  description: string;
  displayValue: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.13em]">{label}</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{description}</p>
        </div>
        <span className="text-2xl font-bold font-mono text-[var(--text)] shrink-0">{displayValue}</span>
      </div>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ONBOARDING SCREEN
// ════════════════════════════════════════════════════════════════════════════

function OnboardingScreen({
  slide, slideIdx, total, onNext, onBack, isLast, playerName,
}: {
  slide: OnboardingSlide;
  slideIdx: number;
  total: number;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
  playerName: string;
}) {
  return (
    <div className="slide-root">
      <header className="slide-header">
        <span className="text-[12px] font-medium text-[var(--text-muted)]">BharatQuick · Case Study</span>
        <span className="text-[11px] text-[var(--text-muted)]">{playerName}</span>
      </header>

      <main className="slide-main">
        {slide.type === 'text'  && <TextSlide  slide={slide} />}
        {slide.type === 'memo'  && <MemoSlide  slide={slide} />}
        {slide.type === 'guide' && <GuideSlide slide={slide} />}
      </main>

      <footer className="slide-footer">
        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                i === slideIdx
                  ? 'bg-indigo-500 w-5'
                  : i < slideIdx
                  ? 'bg-slate-600 w-1.5'
                  : 'bg-slate-800 w-1.5'
              }`}
            />
          ))}
        </div>
        {/* Navigation */}
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          <button
            id="onboarding-next-btn"
            onClick={onNext}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[var(--text)] text-[13px] font-medium rounded-lg transition-colors"
          >
            {isLast ? 'Begin Simulation' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}

// ── Text slide ──────────────────────────────────────────────────────────────

function TextSlide({ slide }: { slide: OnboardingSlide }) {
  const half = Math.ceil(slide.paragraphs.length / 2);
  const left  = slide.paragraphs.slice(0, half);
  const right = slide.paragraphs.slice(half);
  const twoCol = slide.paragraphs.length > 2;

  return (
    <div className="max-w-5xl mx-auto px-10 lg:px-16 py-14">
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-5">
        {slide.category}
      </p>
      <h1 className="font-display text-[3.2rem] lg:text-[4rem] font-bold italic text-[var(--text)] leading-none mb-2">
        {slide.headline}
      </h1>
      {slide.subheadline && (
        <p className="text-base text-[var(--text-muted)] font-light mb-8">{slide.subheadline}</p>
      )}
      <div className="h-px bg-[var(--surface-alt)] mb-10" />
      <div className={twoCol ? 'grid grid-cols-1 lg:grid-cols-2 gap-12' : 'max-w-2xl'}>
        <div className="prose-sim space-y-5">{left.map((p, i) => <p key={i}>{p}</p>)}</div>
        {twoCol && (
          <div className="prose-sim space-y-5">{right.map((p, i) => <p key={i}>{p}</p>)}</div>
        )}
      </div>
    </div>
  );
}

// ── Memo slide ──────────────────────────────────────────────────────────────

function MemoSlide({ slide }: { slide: OnboardingSlide }) {
  return (
    <div className="max-w-3xl mx-auto px-10 lg:px-16 py-14">
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-5">
        {slide.category}
      </p>
      <h1 className="font-display text-[2.6rem] font-bold italic text-[var(--text)] leading-tight mb-1">
        {slide.headline}
      </h1>
      {slide.subheadline && (
        <p className="text-[13px] text-[var(--text-muted)] font-light mb-8">{slide.subheadline}</p>
      )}
      <div className="h-px bg-[var(--surface-alt)] mb-10" />
      {slide.memo && (
        <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-6">
          From: {slide.memo.from}
        </p>
      )}
      <div className="border-l-2 border-[var(--border)] pl-8">
        <div className="prose-sim space-y-5">
          {slide.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </div>
  );
}

// ── Guide slide (Simulation Guide) ─────────────────────────────────────────

function GuideSlide({ slide }: { slide: OnboardingSlide }) {
  return (
    <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12">
      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-4">
        {slide.category}
      </p>
      <h1 className="font-display text-[2.6rem] font-bold italic text-[var(--text)] mb-6">
        {slide.headline}
      </h1>
      <div className="h-px bg-[var(--surface-alt)] mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left: intro paragraphs + glossary */}
        <div>
          <div className="prose-sim space-y-4 mb-8">
            {slide.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {slide.glossary && (
            <>
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-4">
                Key Terms
              </p>
              <div className="space-y-4">
                {slide.glossary.map((g, i) => (
                  <div key={i}>
                    <span className="text-[12px] font-semibold text-[var(--text)]">{g.term}</span>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{g.definition}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: decision levers */}
        {slide.levers && (
          <div>
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-4">
              Decision Levers
            </p>
            <div className="space-y-4">
              {slide.levers.map((lv, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded bg-indigo-600/10 border border-indigo-600/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[9px] font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--text)]">{lv.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{lv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  ROUND BRIEF SCREEN
// ════════════════════════════════════════════════════════════════════════════

function RoundBriefScreen({
  story, round, playerName, prevScore, onEnter,
}: {
  story: RoundStory;
  round: number;
  playerName: string;
  prevScore: number | null;
  onEnter: () => void;
}) {
  const total    = ONBOARDING_CONTENT.length + 1;
  const slideIdx = ONBOARDING_CONTENT.length; // always last dot

  return (
    <div className="slide-root">
      <header className="slide-header">
        <span className="text-[12px] font-medium text-[var(--text-muted)]">BharatQuick · Case Study</span>
        <div className="flex items-center gap-4">
          {prevScore !== null && (
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              HES: <span className="text-indigo-400 font-semibold">{prevScore}</span>
            </span>
          )}
          <span className="text-[11px] text-[var(--text-muted)]">{playerName}</span>
        </div>
      </header>

      <main className="slide-main">
        <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Story - left 3 cols */}
            <div className="lg:col-span-3">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-4">
                {story.act}
              </p>
              <h1 className="font-display text-[3rem] lg:text-[3.5rem] font-bold italic text-[var(--text)] leading-tight mb-8">
                {story.title}
              </h1>
              <div className="h-px bg-[var(--surface-alt)] mb-8" />
              <div className="prose-sim space-y-5">
                {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>

            {/* Available actions - right 2 cols */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 sticky top-8">
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-5">
                  Available Actions This Round
                </p>
                <div className="space-y-4">
                  {story.available_actions.map((action, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-5 h-5 rounded bg-[var(--surface-alt)] flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-semibold text-[var(--text-muted)]">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[var(--text)]">{action.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="slide-footer">
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                i === slideIdx
                  ? 'bg-indigo-500 w-5'
                  : 'bg-slate-600 w-1.5'
              }`}
            />
          ))}
        </div>
        <button
          id="enter-round-btn"
          onClick={onEnter}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-[var(--text)] text-[13px] font-medium rounded-lg transition-colors group"
        >
          Enter Round {round}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  END SCREEN
// ════════════════════════════════════════════════════════════════════════════

function EndScreen({
  playerName, score, metrics,
}: {
  playerName: string;
  score: number;
  metrics: any;
}) {
  const label =
    score >= 75 ? 'Excellent'
    : score >= 60 ? 'Satisfactory'
    : score >= 45 ? 'Needs Review'
    : 'Below Standard';

  return (
    <div className="min-h-screen bg-[#050a18] bg-grid flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">

        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.22em] mb-6">
          Simulation Complete · CompSim Pro
        </p>
        <h1 className="font-display text-[3rem] font-bold italic text-[var(--text)] leading-none mb-2">
          BharatQuick
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] font-light mb-1">Total Rewards Strategy Simulation</p>
        <p className="text-[11px] text-[var(--text-muted)] mb-10">MBA Case Study</p>

        <div className="h-px bg-[var(--surface-alt)] mb-10" />

        <p className="text-[14px] font-medium text-[var(--text)] mb-0.5">{playerName}</p>
        <p className="text-[11px] text-[var(--text-muted)] mb-10">Compensation Lead, Total Rewards · BharatQuick</p>

        {/* HES score */}
        <div className="inline-flex flex-col items-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-12 py-8 mb-8 w-full">
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.18em] mb-2">
            Final Human Equity Score
          </p>
          <div className="text-[5rem] font-bold font-mono text-indigo-400 leading-none mb-2">
            {score}
          </div>
          <div className="text-[11px] font-medium text-[var(--text-muted)]">{label}</div>
        </div>

        {/* Final metrics */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { l: 'Engagement',  v: fmtPct(metrics.engagement ?? 0.75) },
            { l: 'Turnover',    v: fmtPct(metrics.turnover ?? 0.08)    },
            { l: 'Parity p',    v: metrics.pValue?.toFixed(3) ?? '-'   },
          ].map((m) => (
            <div key={m.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-xl font-bold font-mono text-[var(--text)] mb-1">{m.v}</div>
              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{m.l}</div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Your decisions across six quarters have shaped BharatQuick's compensation strategy and IPO readiness. Debrief with your class to discuss the trade-offs and alternative approaches.
        </p>
      </div>
    </div>
  );
}

