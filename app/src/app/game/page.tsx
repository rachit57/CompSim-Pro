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
  MARKET_SIGNALS_PER_ROUND,
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
import { RoundMechanics } from '@/components/RoundMechanics';

// ── TYPES ───────────────────────────────────────────────────────────────────

type GameTab = 'situation' | 'workforce' | 'market' | 'decisions';

type Phase =
  | { type: 'onboarding'; slide: number }
  | { type: 'round-brief' }
  | { type: 'playing'; tab: GameTab }
  | { type: 'end' };

interface Decisions {
  [key: string]: any;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────

const DEFAULT_DECISIONS: Decisions = {};

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
  const [clientRound, setClientRound] = useState<number | null>(null);
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
      setClientRound(null); // Sync back to server's truth if the professor advances it globally
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
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Connecting to session…</p>
        </div>
      </div>
    );
  }

  const round: number   = clientRound ?? sessionData.round ?? 1;
  const myId            = socket.id as string;
  const myPlayer        = sessionData.players?.[myId];
  const metrics         = myPlayer?.metrics ?? {
    budgetUtil: 0, turnover: 0.08, engagement: 0.75, pValue: 0.082, roi: 0,
  };
  const workforce: any[] = myPlayer?.workforce ?? sessionData.workforce ?? [];

  // ── SUBMIT ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    socket.emit('submit_decision', {
      sessionCode,
      decisions: { ...decisions, promotions: promoted, round },
    });
    setSubmitted(true);
    
    // Auto advance local state
    if (round < 6) {
      setClientRound(round + 1);
      setPhase({ type: 'round-brief' }); 
      setDecisions(DEFAULT_DECISIONS);
      setPromoted([]);
      setInterviewed([]);
      setSubmitted(false);
    } else {
      setSubmitted(true);
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
    let quote = EMPLOYEE_PULSE[round]?.[emp.id];
    
    if (!quote) {
      const cr = emp.currentPay / emp.marketMid;
      const distractors = [
        `I heard the ${emp.dept} team in Bengaluru is getting a special retention bonus. Is that true?`,
        `Just keeping my head down. Though the new cafeteria vendor is terrible.`,
        `Recruiters from the fintech sector have been messaging me on LinkedIn a lot lately.`,
        `I'm focused on my OKRs, but the lack of clarity on the upcoming IPO timeline is distracting.`,
        `Did you see the latest Glassdoor review? It mentioned significant pay disparities in our division.`,
        `Honestly, I'm just trying to hit my targets. But morale feels a bit shaky in the broader team.`
      ];
      const randomDistractor = distractors[(emp.id.charCodeAt(0) + emp.id.charCodeAt(1) + round) % distractors.length];

      if (emp.isToxic) {
        quote = `Honestly, I carry this entire team. The others are dragging their feet, and I have to constantly fix their mistakes just so we hit our targets. It's exhausting being the only competent one here.`;
      } else if (cr < 0.85 && emp.performance >= 4) {
        quote = `I'm delivering top ratings, but my pay is severely below market (${(cr*100).toFixed(0)}% of median). I need a structural adjustment, not just a standard merit hike.`;
      } else if (cr < 0.85) {
        quote = `My cost of living has gone up, but my pay hasn't kept pace. I'm struggling with the current band.`;
      } else if (cr > 1.15) {
        quote = `I'm very happy with my compensation right now. Just focused on hitting my targets and helping the team.`;
      } else {
        quote = randomDistractor;
      }
    }

    if (!alreadyDone) {
      if (interviewed.length >= 4) return;
      setInterviewed((prev) => [...prev, emp.id]);
    }
    // Look up name/role from workforce data
    setPulse({ name: emp.name, role: emp.role, quote });
  };

  const handleAudit = (id: string) => {
    socket.emit('hr_audit', { sessionCode, targetId: id });
  };

  const handleTerminate = (id: string) => {
    if (confirm('Are you sure you want to fire this employee? This will cost 15 Political Capital.')) {
      socket.emit('fire_employee', { sessionCode, targetId: id });
      setPulse(null); // Close interview modal if open
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  //  PHASE: FIRED (GAME OVER)
  // ════════════════════════════════════════════════════════════════════════

  if (myPlayer?.isFired) {
    return (
      <div className="min-h-screen bg-neutral-950 text-red-500 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-20 h-20 mb-6 text-red-600 animate-pulse" />
        <h1 className="text-5xl font-bold mb-4 uppercase tracking-widest text-red-500">You Are Fired</h1>
        <p className="max-w-xl text-red-400/80 mb-8 text-lg">
          You have exhausted all Political Capital with the Board of Directors. 
          Your failure to balance budget efficiency with talent retention and corporate governance has led to your immediate termination.
        </p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 rounded border border-red-500/30 transition-colors uppercase tracking-widest text-sm font-semibold">
          Leave Building
        </button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">

      {/* Error banner */}
      {errMsg && (
        <div className="bg-red-950/80 text-red-300 text-xs px-4 py-2 text-center border-b border-red-900">
          {errMsg}
        </div>
      )}

      {/* Top header */}
      <header className="flex-none h-12 border-b border-[var(--border)] px-6 flex items-center justify-between bg-[var(--bg)] sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-[var(--text)]">BharatQuick</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[11px] text-[var(--text-muted)]">CompSim Pro</span>
          <div className="ml-8 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-medium">HES Score</span>
              <span className={`text-[12px] font-mono font-bold ${Number(myPlayer?.score || 75) >= 65 ? 'text-emerald-500' : 'text-amber-500'}`}>{myPlayer?.score ?? '75.00'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Budget Utilized</span>
              <span className="text-[12px] font-mono font-semibold text-[var(--text)]">{metrics.budgetUtil.toFixed(2)} Cr</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-medium">Flight Risk</span>
              <span className={`text-[12px] font-mono font-bold ${metrics.turnover < 0.1 ? 'text-[var(--text)]' : 'text-red-500'}`}>{fmtPct(metrics.turnover)}</span>
            </div>
          </div>
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
            Capital:&nbsp;
            <span className={(myPlayer?.politicalCapital || 0) < 30 ? 'text-red-500' : 'text-emerald-600'}>
              {myPlayer?.politicalCapital || 100}
            </span>
          </span>
          <span>
            Shadow Debt:&nbsp;
            <span className={(myPlayer?.shadowDebt || 0) > 0 ? 'text-amber-500' : 'text-[var(--text-muted)]'}>
              {fmtLPA(myPlayer?.shadowDebt || 0)}
            </span>
          </span>
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
          <div className="flex flex-col gap-8 animate-in">
            {myPlayer?.isUnionStriking && (
              <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                  <div>
                    <h2 className="text-lg font-bold text-red-500 uppercase tracking-widest mb-1">Union Strike in Progress</h2>
                    <p className="text-[13px] text-red-400/90 mb-3">
                      Tier 3 & Tier 4 employees have unionized and are currently on strike due to severe pay inequity (Average Comp-Ratio dropped below 80%). All operational performance (ROI) has been frozen to 0. You must address base pay immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

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
                          className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-semibold mt-0.5 border ${
                            n < round
                              ? 'bg-emerald-700/25 text-emerald-500 border-emerald-900/50'
                              : n === round
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)]'
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
          </div>
        )}

        {/* ── WORKFORCE & GRAPEVINE ─────────────────────────────────────── */}
        {tab === 'workforce' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in">
            <div className="lg:col-span-1 space-y-6">
              {/* Org Chart / Grapevine */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="text-[13px] font-semibold text-[var(--text)] mb-3">Grapevine Network</h3>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-4">
                  Visual mapping of reporting lines and peer connections. Parity imbalances between connected nodes penalize retention.
                </p>
                <div className="space-y-3">
                  {workforce.filter((e: any) => e.connections && e.connections.length > 0).slice(0, 8).map((emp: any) => (
                    <div key={emp.id} className="text-[11px]">
                      <div className="font-medium text-[var(--text)] flex items-center justify-between">
                        {emp.name} <span className="text-[9px] text-[var(--text-muted)] px-1.5 py-0.5 bg-[var(--surface-alt)] rounded border border-[var(--border)]">{emp.id}</span>
                      </div>
                      <div className="text-[var(--text-muted)] ml-2 border-l border-[var(--border)] pl-2 mt-1 py-0.5">
                        <span className="text-[9px] uppercase tracking-wider">Talks to:</span>{' '}
                        <span className="text-[var(--text)] font-medium">
                          {emp.connections.map((cId: string) => {
                            const p = workforce.find((w: any) => w.id === cId);
                            return p ? p.name.split(' ')[0] : cId;
                          }).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden flex flex-col">
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
                      <th className="text-center px-4 py-3">Rating</th>
                      <th className="text-right px-4 py-3">CTC</th>
                      <th className="text-right px-4 py-3">Comp-Ratio</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {workforce.map((emp: any) => {
                      const wasInterviewed = interviewed.includes(emp.id);
                      const isPromoted   = promoted.includes(emp.id);

                      return (
                        <tr key={emp.id} className="hover:bg-[var(--surface-alt)] transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="text-[13px] font-medium text-[var(--text)]">{emp.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{emp.role}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded">
                              {emp.level}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-[12px] text-[var(--text-muted)]">{emp.city}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Tier {emp.tier}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center flex flex-col items-center gap-1">
                            <span className={`text-[12px] font-semibold font-mono ${
                              emp.performance >= 4
                                ? 'text-emerald-400'
                                : emp.performance >= 3
                                ? 'text-[var(--text-muted)]'
                                : 'text-red-400'
                            }`}>
                              {emp.performance} {emp.audited ? '(True)' : '(Mgr)'}
                            </span>
                            {!emp.audited && (
                              <button
                                onClick={() => handleAudit(emp.id)}
                                className="text-[9px] text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 hover:bg-indigo-500/10"
                                title="Costs 5 Political Capital"
                              >
                                Audit (-5 Cap)
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] text-[var(--text)]">
                            {fmtLPA(emp.currentPay)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] font-mono font-medium text-[var(--text)]">
                                {fmtCR(emp.currentPay, emp.marketMid)}
                              </span>
                            </div>
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
                                onClick={() => handleTerminate(emp.id)}
                                className="px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors text-red-500 border border-red-500/30 hover:bg-red-500/10"
                                title="Terminate Employment (-15 Capital)"
                              >
                                Fire
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
                  {(MARKET_SIGNALS_PER_ROUND[round] || []).map((s, i) => (
                    <div key={i} className="border-l-2 border-[var(--border)] pl-3.5">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[12px] font-medium text-[var(--text)]">{s.label}</span>
                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                          s.level === 'Critical'    ? 'text-red-500'
                          : s.level === 'High'      ? 'text-amber-500'
                          : 'text-[var(--text-muted)]'
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

              <RoundMechanics 
                round={round} 
                decisions={decisions} 
                setDecisions={setDecisions} 
                workforce={workforce} 
              />
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

