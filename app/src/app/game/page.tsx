"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import { ROUND_STORIES, FORMULA_OPTIONS } from '@/lib/narrative';
import { 
  Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  ChevronRight, Zap, Target, BarChart3, MessageSquare 
} from 'lucide-react';

export default function GameDashboard() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData, hydrated } = useGameStore();
  
  const [decisions, setDecisions] = useState({
    basePayAdj: 0.05,
    variablePay: 0.10,
    benefits: 'standard',
    parityAdj: 0.02
  });

  const [showBriefing, setShowBriefing] = useState(true);
  const [activePersona, setActivePersona] = useState('tech');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sessionData?.round) {
      setShowBriefing(true);
    }
  }, [sessionData?.round]);

  useEffect(() => {
    // WAIT FOR HYDRATION BEFORE DECIDING TO REDIRECT
    if (!hydrated) return;

    if (!sessionCode) {
      router.push('/');
      return;
    }

    socket.connect();
    socket.emit('join_session', { sessionCode, role, playerName });

    socket.on('connect_error', (err) => {
      console.error('!!! Socket Error:', err);
      setErrorMessage(`Network Error: ${err.message}. Check your Vercel/Railway URL settings.`);
    });

    socket.on('session_update', (data) => {
      setErrorMessage(null);
      updateSessionData(data);
    });
    socket.on('round_advanced', (data) => {
      updateSessionData(data);
    });
    socket.on('sudden_challenge', (shock) => {
      alert(`⚠️ MARKET SHOCK: ${shock.title}\n\n${shock.description}`);
    });

    return () => {
      socket.off('session_update');
      socket.off('round_advanced');
      socket.off('sudden_challenge');
    };
  }, [sessionCode, router, updateSessionData, role, playerName, hydrated]);

  // Safe access to player state
  const myId = socket.id as string;
  const myPlayer = sessionData?.players?.[myId];
  
  const currentMetrics = myPlayer?.metrics || {
    budgetUtil: 0.90, turnover: 0.05, engagement: 0.75, pValue: 0.08, roi: 0.65
  };

  if (!sessionData) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-mono">SYNCHRONIZING WITH WAR ROOM...</p>
      </div>
    </div>
  );

  const handleSubmit = () => {
    socket.emit('submit_decision', { sessionCode, decisions });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* ERROR DIAGNOSTIC BANNER */}
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-rose-600 text-white p-2 text-center text-xs font-bold animate-bounce">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* SITUATION REPORT (SitRep) MODAL */}
      {showBriefing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-3xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
             
             <div className="flex items-center gap-4 mb-8 relative">
                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                   <MessageSquare className="text-indigo-400 w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">
                     Round {sessionData.round}: SitRep
                   </h2>
                   <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">Strategic Objective: {sessionData.round === 3 ? 'Formula Validation' : 'Performance Stabilization'}</p>
                </div>
             </div>

             <div className="space-y-6 text-slate-300 relative z-10">
                <div className="bg-slate-950/50 border-l-4 border-indigo-500 p-6 rounded-r-2xl">
                   <p className="text-xl leading-relaxed italic text-indigo-100 font-serif">
                      "{ROUND_STORIES[sessionData.round as keyof typeof ROUND_STORIES]?.story || 'Stabilize the cohort metrics and prepare for market fluctuations.'}"
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Market Context</h3>
                      <p className="text-sm leading-relaxed text-slate-400">
                        Employees are watching your next move. {sessionData.round === 3 ? 'The Board is demanding technical proof of your strategy.' : 'Ensure you balance the budget while maintaining engagement.'}
                      </p>
                   </div>
                   <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key KPIs to Watch</h3>
                      <div className="flex justify-between items-center text-xs">
                         <span>Human Equity Score</span>
                         <span className="text-indigo-400 font-bold">{sessionData.players?.[myId]?.score || '--'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span>Parity Risk (p)</span>
                         <span className={currentMetrics.pValue < 0.05 ? 'text-rose-500' : 'text-emerald-400'}>{currentMetrics.pValue || '0.082'}</span>
                      </div>
                   </div>
                </div>
             </div>

                <div className="mt-8 p-6 bg-indigo-900/10 border border-indigo-500/30 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                   <h3 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" /> Round 3 Formula Audit:
                   </h3>
                   <p className="text-xs text-slate-400 mb-4 italic">Identify the standard formula for 'Market Position' analysis:</p>
                   <div className="grid gap-2">
                      {FORMULA_OPTIONS.map((f, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setShowBriefing(false)}
                          className="w-full text-left p-3 rounded-lg border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 transition text-xs font-mono flex items-center justify-between group"
                        >
                          {f.text}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                   </div>
                </div>

             <button 
                onClick={() => setShowBriefing(false)}
                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition group flex items-center justify-center"
             >
                DEPLOY STRATEGY <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">CompSim <span className="text-indigo-500">Pro</span></h1>
          </div>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest leading-none">
            {playerName} | {role} | {sessionCode}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowBriefing(true)}
            className="p-2 hover:bg-slate-800 rounded-full transition text-slate-500 hover:text-indigo-400"
            title="View Mission Briefing"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="text-right">
             <div className="text-4xl font-black text-slate-200">ROUND 0{sessionData.round || 1}</div>
             <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">System Status: {sessionData.status}</div>
          </div>
          <div className="h-12 w-[1px] bg-slate-800 mx-2" />
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
             <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Live HES Index</div>
             <div className="text-2xl font-mono text-emerald-400 font-bold">{myPlayer?.score || '72.4'}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        
        {/* Column 1: Strategic Decisions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24" />
            </div>
            
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="text-amber-400 w-5 h-5" /> Reward Strategy Mix
            </h2>

            <div className="space-y-8">
              {/* Sliders */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Base Salary Adj.</span>
                  <span className="text-indigo-400">+{Math.round(decisions.basePayAdj * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.25" step="0.01" value={decisions.basePayAdj}
                  onChange={(e) => setDecisions({...decisions, basePayAdj: parseFloat(e.target.value)})}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Var. Pay Pool</span>
                  <span className="text-indigo-400">{Math.round(decisions.variablePay * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.40" step="0.02" value={decisions.variablePay}
                  onChange={(e) => setDecisions({...decisions, variablePay: parseFloat(e.target.value)})}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Equity Correction</span>
                  <span className="text-emerald-400">+{Math.round(decisions.parityAdj * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="0.10" step="0.01" value={decisions.parityAdj}
                  onChange={(e) => setDecisions({...decisions, parityAdj: parseFloat(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDecisions({...decisions, benefits: 'standard'})}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${decisions.benefits === 'standard' ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
                >
                  Standard 
                </button>
                <button 
                  onClick={() => setDecisions({...decisions, benefits: 'premium'})}
                  className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${decisions.benefits === 'premium' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
                >
                  Premium Ben.
                </button>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition group flex items-center justify-center"
              >
                DEPLOY ROUND DECISIONS <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>

        {/* Column 2: Talent Personas & Risk Heatmap */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
           <section className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-indigo-400 w-5 h-5" /> Talent Persona Hub
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-6">
                 {Object.keys(sessionData.personas || {}).map(p => (
                   <button 
                    key={p} 
                    onClick={() => setActivePersona(p)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition ${activePersona === p ? 'bg-indigo-500 bg-opacity-20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500 border border-transparent'}`}
                   >
                     {p}
                   </button>
                 ))}
              </div>

              {sessionData.personas?.[activePersona] && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{sessionData.personas[activePersona].title}</h3>
                      <p className="text-slate-500 text-xs uppercase tracking-tight">{sessionData.personas[activePersona].count} Employees | Avg. ${sessionData.personas[activePersona].avgPay.toLocaleString()}</p>
                    </div>
                    <div className="bg-rose-500/10 text-rose-500 p-2 rounded-lg">
                       <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-900 border-l-2 border-amber-500 p-4 rounded-r-lg">
                    <p className="text-sm italic text-slate-400 flex items-start">
                      <MessageSquare className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-slate-600" />
                      "{sessionData.personas[activePersona].chatter}"
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                      <span>Persona Attrition Risk</span>
                      <span className={currentMetrics.personaRisk?.[activePersona] > 0.1 ? 'text-rose-500' : 'text-emerald-500'}>
                        {Math.round((currentMetrics.personaRisk?.[activePersona] || 0.05) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${currentMetrics.personaRisk?.[activePersona] > 0.1 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(currentMetrics.personaRisk?.[activePersona] || 0.05) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
           </section>

           <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-indigo-500 opacity-20"><BarChart3 className="w-12 h-12" /></div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">P-Value Parity</div>
                <div className={`text-2xl font-mono font-bold ${currentMetrics.pValue < 0.05 ? 'text-rose-500 animate-pulse' : 'text-slate-100'}`}>{currentMetrics.pValue || '0.082'}</div>
                <div className="text-[9px] mt-1 text-slate-600">Threshold: 0.05</div>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-emerald-500 opacity-20"><TrendingUp className="w-12 h-12" /></div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Retention ROI</div>
                <div className="text-2xl font-mono font-bold text-slate-100">{Math.round((currentMetrics.roi || 0.65) * 100)}%</div>
                <div className="text-[9px] mt-1 text-slate-600">Cumulative Efficiency</div>
              </div>
           </section>
                {/* Column 3: Communication Center & Market Ticker */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <section className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
                 <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <MessageSquare className="text-indigo-400 w-4 h-4" /> Comm Center
                 </h2>
                 <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">LIVE FEED</span>
              </div>

              <div className="flex-grow p-4 space-y-4 overflow-auto bg-slate-900/30">
                 {/* STORY MEMO */}
                 <div className="bg-indigo-900/10 border-l-2 border-indigo-500 p-4 rounded-r-xl group hover:bg-indigo-900/20 transition-all cursor-default">
                    <div className="text-[9px] font-black text-indigo-400 uppercase mb-1 tracking-tighter flex justify-between">
                       <span>FROM: BOARD OF DIRECTORS</span>
                       <span>PRIORITY: HIGH</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-serif italic">
                       "{sessionData.round === 3 ? 'We require technical proof of your range spread calculations.' : 'The quarterly efficiency targets are non-negotiable. Projections show high risk.'}"
                    </p>
                 </div>

                 {/* SLACK MESSAGE */}
                 <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-5 h-5 rounded bg-amber-500 text-[10px] flex items-center justify-center font-bold text-slate-900">#</div>
                       <span className="text-[10px] font-black text-slate-400 uppercase">#general-chatter</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      "Heard rumors about the {sessionData.round === 4 ? 'equity audit' : 'new bonus pool'}. People are checking other offers already..."
                    </p>
                 </div>

                 {/* INDUSTRY NEWS */}
                 <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                          <BarChart3 className="w-3 h-3 text-slate-500" />
                       </div>
                       <span className="text-[10px] font-black text-slate-300 uppercase italic">HR Market Intel</span>
                    </div>
                    <div className="space-y-3">
                       <p className="text-[11px] text-slate-400 leading-tight">
                         • Competitor X raises base pay by 12% in the tech sector.
                       </p>
                       <p className="text-[11px] text-slate-400 leading-tight">
                         • Global inflation spikes; workforce demanding 'Cost of Living' adjustments.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-3">
                   <div className="text-[9px] uppercase font-black text-emerald-400 mb-1">Strategic Advice</div>
                   <p className="text-[10px] text-slate-500 italic leading-snug">
                     {sessionData.round === 3 ? 'Ensure your Comp-Ratio logic is defensible.' : 'Higher base pay reduces immediate churn but hits ROI hard.'}
                   </p>
                </div>
              </div>
           </section>
        </div>
 </div>

      </main>

      {/* Footer / Status Ticker */}
      <footer className="mt-8 border-t border-slate-800 pt-4 flex justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
         <div>Sim Engine v2.1.0-MBA | HighFidelity-Simulation-Active</div>
         <div>© 2026 CompSim Pro Systems</div>
      </footer>
    </div>
  );
}
