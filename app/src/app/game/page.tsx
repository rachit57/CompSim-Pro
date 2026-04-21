"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import { ROUND_STORIES, NARRATIVE_DOSSIER, EMPLOYEE_PULSE } from '@/lib/narrative';
import { 
  Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  ChevronRight, Zap, Target, BarChart3, MessageSquare 
} from 'lucide-react';

export default function GameDashboard() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData, hydrated } = useGameStore();
  
  const [decisions, setDecisions] = useState({
    meritPool: 0.08,
    salesAcc: 1.0,
    ltiMix: 0.2,
    parityPool: 0
  });

  const [activeTab, setActiveTab] = useState<'briefing' | 'workforce' | 'market' | 'execution'>('briefing');
  const [promotedEmployees, setPromotedEmployees] = useState<string[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);
  const [selectedPulse, setSelectedPulse] = useState<{name: string, quote: string} | null>(null);
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
    socket.emit('submit_decision', { 
      sessionCode, 
      decisions: { ...decisions, promotions: promotedEmployees } 
    });
    alert("Strategic Plan Deployed to HQ.");
  };

  const togglePromotion = (id: string) => {
    setPromotedEmployees(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
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
                   <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.2em] mt-1">Strategic Objective: Decision Execution</p>
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
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Market Status</h3>
                      <p className="text-sm leading-relaxed text-slate-400">
                        The board is watching. Use the **Workforce Hub** to conduct 1-on-1s and uncover the real sentiment behind these numbers.
                      </p>
                   </div>
                   <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Metrics</h3>
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

             <button 
                onClick={() => setShowBriefing(false)}
                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition group flex items-center justify-center"
             >
                ENTER COMMAND CENTER <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <nav className="max-w-7xl mx-auto flex bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-8 shadow-inner">
         {[
           { id: 'briefing', label: 'Strategic Dossier', icon: MessageSquare },
           { id: 'workforce', label: 'Workforce Hub', icon: Users },
           { id: 'market', label: 'Market Intel', icon: BarChart3 },
           { id: 'execution', label: 'Strategic Console', icon: Zap },
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </nav>

      <main className="max-w-7xl mx-auto min-h-[600px]">
        
        {/* TAB 1: STRATEGIC DOSSIER (THE STORY) */}
        {activeTab === 'briefing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-8 h-[700px] overflow-auto pr-4 scrollbar-hide">
                <section className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquare className="w-32 h-32" /></div>
                   <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Direct Communication</h3>
                   <h2 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">{NARRATIVE_DOSSIER.ceo_memo.title}</h2>
                   <div className="text-slate-500 text-[10px] font-mono mb-4 uppercase">Sender: {NARRATIVE_DOSSIER.ceo_memo.author}</div>
                   <p className="text-slate-300 text-sm leading-relaxed font-serif whitespace-pre-line">{NARRATIVE_DOSSIER.ceo_memo.content}</p>
                </section>
                <section className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
                   <h3 className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Internal Intel</h3>
                   <h2 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">{NARRATIVE_DOSSIER.board_intercept.title}</h2>
                   <div className="text-slate-500 text-[10px] font-mono mb-4 uppercase">Source: {NARRATIVE_DOSSIER.board_intercept.author}</div>
                   <p className="text-slate-300 text-sm leading-relaxed font-serif whitespace-pre-line">{NARRATIVE_DOSSIER.board_intercept.content}</p>
                </section>
             </div>
             <div className="space-y-8 h-[700px] overflow-auto pr-4 scrollbar-hide">
                <section className="bg-slate-950/50 border border-amber-500/20 p-8 rounded-3xl border-l-4 border-l-amber-500">
                   <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Market Intelligence</h3>
                   <h2 className="text-2xl font-black italic mb-6 uppercase tracking-tighter underline decoration-amber-500 underline-offset-8">{NARRATIVE_DOSSIER.market_gossip.title}</h2>
                   <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line font-mono mt-4">{NARRATIVE_DOSSIER.market_gossip.content}</p>
                </section>
                <section className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl border-dashed">
                   <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Operational Protocol</h3>
                   <h2 className="text-xl font-black italic mb-4 uppercase tracking-tighter">Instructions</h2>
                   <p className="text-slate-400 text-xs leading-relaxed italic">
                      "Data in the 'Market Intel' tab is raw intelligence. Use the 'Workforce Hub' to conduct 1-on-1s. Real strategic insights aren't found in benchmarks—they are found in conversations. Trust your deduction, not just your budget."
                   </p>
                </section>
             </div>
          </div>
        )}

        {/* TAB 2: WORKFORCE HUB (INDIVIDUAL AUDIT) */}
        {activeTab === 'workforce' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="p-6 bg-slate-800/50 flex justify-between items-center border-b border-slate-700">
                <div>
                   <h2 className="text-xl font-black italic uppercase italic">Salary & Equity Audit</h2>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Real-time Employee Master File | Case Study: BharatQuick</p>
                </div>
                <div className="flex gap-4">
                   <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-700 text-center">
                      <div className="text-[8px] text-slate-500 font-black uppercase">Cohort Avg CR</div>
                      <div className="text-sm font-bold text-indigo-400">0.94</div>
                   </div>
                   <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-700 text-center text-rose-500">
                      <div className="text-[8px] text-slate-500 font-black uppercase">Green Circles</div>
                      <div className="text-sm font-bold animate-pulse">03</div>
                   </div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-black tracking-widest leading-none border-b border-slate-800">
                      <tr>
                         <th className="p-4">Employee/Role</th>
                         <th className="p-4">Grade</th>
                         <th className="p-4">Location</th>
                         <th className="p-4 text-center">Perf (1-5)</th>
                         <th className="p-4">Current Salary</th>
                         <th className="p-4">Comp-Ratio</th>
                         <th className="p-4">Status</th>
                         <th className="p-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {(sessionData?.workforce || []).map((emp: any) => (
                        <tr key={emp.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition group">
                           <td className="p-4">
                              <div className="font-bold text-slate-200">{emp.name}</div>
                              <div className="text-[10px] text-slate-500 uppercase">{emp.role}</div>
                           </td>
                           <td className="p-4 font-mono text-xs">{emp.level}</td>
                           <td className="p-4">
                              <div className="text-xs text-slate-300">{emp.city}</div>
                              <div className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">Tier {emp.tier} City</div>
                           </td>
                           <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-black ${emp.performance >= 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                 {emp.performance}
                              </span>
                           </td>
                           <td className="p-4 font-mono text-sm">₹{(emp.currentPay/100000).toFixed(1)}L</td>
                           <td className="p-4">
                              <div className="flex items-center gap-2">
                                 <span className="font-mono text-xs text-indigo-400">{(emp.currentPay/emp.marketMid).toFixed(2)}</span>
                                 <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{width: `${(emp.currentPay/emp.marketMid)*100}%`}} />
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              {emp.currentPay/emp.marketMid < 0.85 ? <span className="text-[8px] bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded uppercase font-black animate-pulse">Green Circle</span> : <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">Stable</span>}
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2 text-right">
                                <button 
                                  onClick={() => {
                                    const quote = EMPLOYEE_PULSE[sessionData.round]?.[emp.id] || "Everything seems fine for now. We are just waiting to see the next merit cycle.";
                                    setSelectedPulse({ name: emp.name, quote });
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
                                >
                                   1-on-1
                                </button>
                                <button 
                                  onClick={() => togglePromotion(emp.id)}
                                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition ${promotedEmployees.includes(emp.id) ? 'bg-emerald-600 text-white border-none' : 'bg-transparent border border-slate-700 text-slate-400 hover:border-indigo-500'}`}
                                >
                                   {promotedEmployees.includes(emp.id) ? 'Promoted' : 'Promote'}
                                </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* TAB 3: MARKET INTEL (BENCHMARKS) */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
             <section className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                   <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
                      <BarChart3 className="text-indigo-400 w-6 h-6" /> Geographic Market Benchmarks (P50)
                   </h2>
                   <div className="space-y-6">
                      {[
                        { tier: 'Tier 1 (Mumbai/BLR)', staff: '₹18-25L', sales: '₹12L + Acc', exec: '₹60-90L' },
                        { tier: 'Tier 2 (Pune/HYD)', staff: '₹12-18L', sales: '₹8L + Acc', exec: '₹45-60L' },
                        { tier: 'Tier 3 (Jaipur/Kochi)', staff: '₹6-10L', sales: '₹5L + Acc', exec: '₹30-40L' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-indigo-500 transition-colors">
                           <span className="font-bold text-slate-200">{item.tier}</span>
                           <div className="flex gap-6 text-xs font-mono">
                              <span className="text-slate-500">Staff: <b className="text-indigo-400">{item.staff}</b></span>
                              <span className="text-slate-500">Sales: <b className="text-emerald-400">{item.sales}</b></span>
                              <span className="text-slate-500">Exec: <b className="text-amber-400">{item.exec}</b></span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </section>
             <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-48 h-48" /></div>
                <h3 className="text-lg font-black italic mb-6 uppercase">Market Outlook</h3>
                <div className="space-y-6">
                   <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                      <h4 className="text-xs font-black text-rose-500 uppercase mb-2">High Volatility</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Tech leads in Metros are demanding 'Equity' parity with US/Global salaries. Retention costs expected to rise by 15%.</p>
                   </div>
                   <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <h4 className="text-xs font-black text-emerald-500 uppercase mb-2">Geo-Op Opportunity</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Tier 3 cities (Jaipur, Indore) showing high productivity with 40% lower compensation overhead.</p>
                   </div>
                </div>
             </section>
          </div>
        )}

        {/* TAB 4: STRATEGIC CONSOLE (EXECUTION) */}
        {activeTab === 'execution' && (
          <div className="grid grid-cols-12 gap-8 animate-in zoom-in-95 duration-500">
             {/* LEFT: SLIDERS */}
             <div className="col-span-12 lg:col-span-6 space-y-6">
                <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                   <h2 className="text-2xl font-black italic mb-8 uppercase tracking-tighter flex items-center gap-3">
                      <Zap className="text-amber-400 w-6 h-6" /> Strategic Reward Mix
                   </h2>
                   
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            <div>
                               <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Overall Merit Pool</div>
                               <div className="text-2xl font-black text-indigo-400">+{Math.round(decisions.meritPool * 100)}%</div>
                            </div>
                            <input 
                              type="range" min="0" max="0.30" step="0.01" value={decisions.meritPool}
                              onChange={(e) => setDecisions({...decisions, meritPool: parseFloat(e.target.value)})}
                              className="w-48 accent-indigo-500"
                            />
                         </div>
                         <p className="text-[10px] text-slate-600 italic">Expected to impact 'Normal Staff' retention by linked Merit Matrix.</p>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            <div>
                               <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Sales Accelerator</div>
                               <div className="text-2xl font-black text-emerald-400">{decisions.salesAcc.toFixed(1)}x</div>
                            </div>
                            <input 
                              type="range" min="1.0" max="3.0" step="0.1" value={decisions.salesAcc}
                              onChange={(e) => setDecisions({...decisions, salesAcc: parseFloat(e.target.value)})}
                              className="w-48 accent-emerald-500"
                            />
                         </div>
                         <p className="text-[10px] text-slate-600 italic">Pay-for-Performance incentive. Rewards high achievement exponentially.</p>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            <div>
                               <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Executive LTI Mix</div>
                               <div className="text-2xl font-black text-amber-500">{Math.round(decisions.ltiMix * 100)}%</div>
                            </div>
                            <input 
                              type="range" min="0" max="0.60" step="0.05" value={decisions.ltiMix}
                              onChange={(e) => setDecisions({...decisions, ltiMix: parseFloat(e.target.value)})}
                              className="w-48 accent-amber-500"
                            />
                         </div>
                         <p className="text-[10px] text-slate-600 italic">Long-term alignment. Solves Agency Theory issues for BharatQuick leadership.</p>
                      </div>

                      <div className="pt-6 border-t border-slate-800">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Promotions</span>
                               <div className="text-xl font-bold text-white">{promotedEmployees.length} Enlisted</div>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equity Adjustment Pool</span>
                               <div className="text-xl font-bold text-emerald-400">₹{(decisions.parityPool/100000).toFixed(1)}L</div>
                            </div>
                         </div>
                         <button 
                           onClick={handleSubmit}
                           className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition group flex items-center justify-center text-sm"
                         >
                            AUTHORIZE ROUND DECISIONS <ChevronRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                </section>
             </div>

             {/* RIGHT: METRIC PREVIEW */}
             <div className="col-span-12 lg:col-span-6 space-y-6">
                <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full flex flex-col justify-between shadow-sm">
                   <div>
                      <h3 className="text-lg font-black italic mb-8 uppercase text-slate-500">Predicted Strategic Impact</h3>
                      <div className="space-y-6">
                         <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center">
                               <div className="text-2xl font-black text-indigo-400">{myPlayer?.score || '78'}</div>
                               <div className="text-[8px] font-bold text-slate-500 uppercase">HES Score</div>
                            </div>
                            <div className="flex-grow">
                               <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                                  <span>Talent Sustainability (1-HES)</span>
                                  <span className="text-emerald-400">EXCELLENT</span>
                               </div>
                               <div className="h-2 w-full bg-slate-950 rounded-full">
                                  <div className="h-full bg-emerald-500" style={{width: `${myPlayer?.score || 78}%`}} />
                               </div>
                            </div>
                         </div>

                         <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Budget Burn Velocity</span>
                               <span className="text-xs font-mono text-emerald-400">SUSTAINABLE</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Equity Theory Parity (p)</span>
                               <span className={`text-xs font-mono ${currentMetrics.pValue < 0.05 ? 'text-rose-500' : 'text-slate-300'}`}>{currentMetrics.pValue || '0.082'}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl mt-12 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                         <Target className="w-5 h-5 text-indigo-400" />
                         <span className="text-[10px] font-black text-indigo-300 uppercase">Leadership Advice</span>
                      </div>
                      <p className="text-xs text-slate-400 italic">"Managing a Consumer-Tech hybrid requires balancing India's Tier-3 cost advantages with Bangalore's tech-inflation pressures. Watch your Comp-Ratio distributions carefully."</p>
                   </div>
                </section>
             </div>
          </div>
        )}
      </main>

      {/* Footer / Status Ticker */}
      <footer className="mt-8 border-t border-slate-800 pt-4 flex justify-between text-[10px] font-mono text-slate-600 uppercase tracking-widest">
         <div>Sim Engine v2.1.0-MBA | HighFidelity-Simulation-Active</div>
         <div>© 2026 CompSim Pro Systems</div>
      </footer>

      {/* 1-on-1 CONFIDENTIAL PULSE MODAL */}
      {selectedPulse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="max-w-lg w-full bg-slate-900 border border-indigo-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-24 h-24" /></div>
              <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Confidential Interview</h3>
              <h2 className="text-2xl font-black italic mb-2 uppercase tracking-tighter">{selectedPulse.name}</h2>
              <div className="bg-slate-950/80 border-l-2 border-indigo-500 p-6 rounded-r-2xl my-6">
                 <p className="text-lg leading-relaxed text-indigo-100 font-serif italic">
                    "{selectedPulse.quote}"
                 </p>
              </div>
              <button 
                onClick={() => setSelectedPulse(null)}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition"
              >
                END 1-ON-1
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
