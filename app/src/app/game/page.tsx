"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socketClient';
import { useGameStore } from '@/lib/store';
import { 
  Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  ChevronRight, Zap, Target, BarChart3, MessageSquare 
} from 'lucide-react';

export default function GameDashboard() {
  const router = useRouter();
  const { sessionCode, role, playerName, sessionData, updateSessionData } = useGameStore();
  
  const [decisions, setDecisions] = useState({
    basePayAdj: 0.05,
    variablePay: 0.10,
    benefits: 'standard',
    parityAdj: 0.02
  });

  const [activePersona, setActivePersona] = useState('tech');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
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
    socket.on('round_advanced', (data) => updateSessionData(data));
    socket.on('sudden_challenge', (shock) => {
      // Custom Modal or Toast could be used here
      alert(`⚠️ MARKET SHOCK: ${shock.title}\n\n${shock.description}`);
    });

    return () => {
      socket.off('session_update');
      socket.off('round_advanced');
      socket.off('sudden_challenge');
    };
  }, [sessionCode, router, updateSessionData, role, playerName]);

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
    // Visual feedback for submission
  };

  const [showBriefing, setShowBriefing] = useState(true);

  // Safe access to player state
  const myId = socket.id as string;
  const myPlayer = sessionData.players?.[myId];
  
  const currentMetrics = myPlayer?.metrics || {
    budgetUtil: 0.90, turnover: 0.05, engagement: 0.75, pValue: 0.08, roi: 0.65
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* ERROR DIAGNOSTIC BANNER */}
      {errorMessage && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-rose-600 text-white p-2 text-center text-xs font-bold animate-bounce">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* MISSION BRIEFING MODAL */}
      {showBriefing && sessionData.round === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                   <Target className="text-indigo-400 w-8 h-8" />
                </div>
                <div>
                   <h2 className="text-3xl font-black italic tracking-tighter uppercase">Mission Briefing</h2>
                   <p className="text-slate-500 text-xs font-mono uppercase tracking-widest leading-none mt-1">Role: Head of Total Rewards</p>
                </div>
             </div>

             <div className="space-y-6 text-slate-300">
                <p className="text-lg leading-relaxed">
                   Welcome to <span className="text-indigo-400 font-bold">CompSim Pro</span>. You have 6 rounds to transform the company's compensation strategy. 
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-emerald-400 font-bold mb-1">HES Score</div>
                      <p className="text-[10px] text-slate-500">Your total success metric. Balance budget vs. results.</p>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-rose-500 font-bold mb-1">P-Value</div>
                      <p className="text-[10px] text-slate-500">The "Parity Alarm". Stay above 0.05 to avoid legal audit.</p>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-amber-400 font-bold mb-1">Retention</div>
                      <p className="text-[10px] text-slate-500">Keep your persona attrition risk low to win.</p>
                   </div>
                </div>

                <ul className="space-y-3 text-sm">
                   <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <span>Adjust the <span className="text-slate-100 font-bold underline decoration-indigo-500 decoration-2">Strategic Mix</span> sliders on the left.</span>
                   </li>
                   <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <span>Check the <span className="text-slate-100 font-bold underline decoration-amber-500 decoration-2">Persona Hub</span> to see who is at risk.</span>
                   </li>
                   <li className="flex items-start gap-2">
                       <ChevronRight className="w-4 h-4 text-indigo-500 mt-0.5" />
                       <span>Watch the <span className="text-slate-100 font-bold underline decoration-emerald-500 decoration-2">Market Intel</span> feed for round-specific hooks.</span>
                   </li>
                </ul>
             </div>

             <button 
                onClick={() => setShowBriefing(false)}
                className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-indigo-500/20 transition group flex items-center justify-center"
             >
                I AM READY TO DEPLOY <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
        </div>

        {/* Column 3: Market Intel & Ticker */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="text-emerald-400 w-5 h-5" /> Market Intelligence
              </h2>

              <div className="flex-grow space-y-4 overflow-auto max-h-[500px] pr-2">
                 <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Round 01 Update</div>
                    <p className="text-xs text-slate-400 leading-relaxed">Tech sector turnover up by 4% across the board. Talent market indices suggest a shift toward benefits and remote work credits.</p>
                 </div>
                 <div className="bg-slate-800/20 border border-slate-800/30 p-4 rounded-xl grayscale">
                    <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">Internal Chatter</div>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"The mid-level managers are starting to compare our bonus pool with the industry average."</p>
                 </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-3">
                   <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">PRO TIP</div>
                   <p className="text-[11px] text-slate-400">Keep your P-Value above 0.05 to avoid legal penalties in the next round audit.</p>
                </div>
              </div>
           </section>
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
