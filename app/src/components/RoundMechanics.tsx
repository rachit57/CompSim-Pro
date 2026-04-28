import React from 'react';

const fmtLPA  = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
const fmtPct  = (n: number) => `${Math.round(n * 100)}%`;

const sliderBg = (frac: number) =>
  `linear-gradient(to right, #4f46e5 ${Math.min(1, Math.max(0, frac)) * 100}%, rgba(255,255,255,0.07) ${Math.min(1, Math.max(0, frac)) * 100}%)`;

export function LeverCard({ id, label, description, displayValue, children }: any) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-indigo-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <label htmlFor={id} className="block text-[13px] font-semibold text-[var(--text)] mb-1">
            {label}
          </label>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed max-w-[280px]">
            {description}
          </p>
        </div>
        <div className="bg-[var(--surface-alt)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
          <span className="text-[13px] font-bold font-mono text-indigo-400">
            {displayValue}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

export function RoundMechanics({ round, decisions, setDecisions, workforce }: any) {
  const update = (key: string, val: any) => setDecisions((d: any) => ({ ...d, [key]: val }));

  if (round === 1) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Strategic Entry & Slotting</h2>
        <LeverCard id="severance" label="Corporate Severance Policy" description="Choice: Barebones (Wins Board approval +10 Capital, but causes -15% Envy & Engagement risk) vs Platinum (Wins Culture, but Board penalizes 'Soft' leadership -15 Capital)." displayValue={decisions.severancePolicy || 'Standard'}>
          <select 
            className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] text-[12px] rounded p-2 w-full"
            value={decisions.severancePolicy || 'Standard'}
            onChange={e => update('severancePolicy', e.target.value)}
          >
            <option value="Barebones">Barebones (Lean/Aggressive)</option>
            <option value="Standard">Standard (Market median)</option>
            <option value="Platinum">Platinum (Employee-First)</option>
          </select>
        </LeverCard>

        <div className="pt-2">
          <h3 className="text-[12px] font-medium text-[var(--text)] mb-3">Job Slotting & Equity Adjustments</h3>
          <div className="space-y-3">
            {workforce.slice(0, 5).map((emp: any) => (
              <div key={emp.id} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] flex justify-between items-center">
                <div>
                  <div className="text-[12px] font-medium text-[var(--text)]">{emp.name} ({emp.role})</div>
                  <div className="text-[10px] text-[var(--text-muted)]">CTC: {fmtLPA(emp.currentPay)} | Perf: {emp.performance}/5</div>
                </div>
                <input 
                  type="number" step={50000}
                  className="bg-[var(--surface-alt)] border border-[var(--border)] rounded px-2 py-1 text-[12px] w-24 text-[var(--text)]"
                  placeholder="₹ Increase"
                  value={decisions?.equityAllocations?.[emp.id] || ''}
                  onChange={e => {
                    const alloc = { ...(decisions.equityAllocations || {}) };
                    alloc[emp.id] = Number(e.target.value);
                    update('equityAllocations', alloc);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (round === 2) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Geo-Tiering & Executive Benefits</h2>
        <LeverCard id="benefits" label="Wellness & Benefits Tier" description="Choice: Core (Lean ops +10% short-term ROI, but causes 10% Skill Decay) vs Elite (Max retention, but triggers +40 Shadow Debt)." displayValue={decisions.benefitsTier || 'Core'}>
          <select 
            className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] text-[12px] rounded p-2 w-full"
            value={decisions.benefitsTier || 'Core'}
            onChange={e => update('benefitsTier', e.target.value)}
          >
            <option value="Core">Core (Efficiency Focus)</option>
            <option value="Plus">Plus (Balanced)</option>
            <option value="Elite">Elite (Retention Focus)</option>
          </select>
        </LeverCard>

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <label className="block text-[12px] font-medium text-[var(--text)] mb-2">Target Market Percentile</label>
          <select 
            className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] text-[12px] rounded p-2 w-full"
            value={decisions.targetPercentile || 50}
            onChange={e => update('targetPercentile', Number(e.target.value))}
          >
            <option value={50}>P50 (Match Market Median)</option>
            <option value={75}>P75 (Lead Market - Aggressive)</option>
            <option value={90}>P90 (Top Decile - Hyper Growth)</option>
          </select>
        </div>

        <LeverCard id="tier2" label="Tier 2 City Multiplier" description="Baseline pay reduction for Tier 2 hubs compared to Tier 1." displayValue={`${(decisions.tier2Mult || 0.8) * 100}%`}>
          <input type="range" min={0.5} max={1.0} step={0.05} value={decisions.tier2Mult || 0.8} onChange={e => update('tier2Mult', Number(e.target.value))} style={{ background: sliderBg(((decisions.tier2Mult || 0.8) - 0.5) / 0.5) }} />
        </LeverCard>
      </div>
    );
  }

  if (round === 3) {
    const wE = decisions.wEbitda || 0;
    const wD = decisions.wDiv || 0;
    const wI = decisions.wInd || 0;
    const wT = decisions.wTeam || 0;
    const wC = decisions.wCsat || 0;
    const wL = decisions.wLongTerm || 0;
    const total = wE + wD + wI + wT + wC + wL;
    
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Advanced Matrix & Crisis Control</h2>
        
        {/* ENTROPY MECHANIC: Strike Negotiation */}
        {decisions.isUnionStriking && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 animate-pulse">
            <h3 className="text-[12px] font-bold text-red-500 mb-1 flex items-center gap-2">
              ⚠️ UNION STRIKE IN PROGRESS
            </h3>
            <p className="text-[10px] text-red-400/80 mb-3 leading-relaxed">
              Tier 3/4 employees have halted operations. ROI is currently 0. Every choice has a permanent consequence.
            </p>
            <select 
              className="bg-black/40 border border-red-500/30 text-red-200 text-[11px] rounded p-2 w-full outline-none focus:border-red-500"
              value={decisions.settlementPremium || 'none'}
              onChange={e => update('settlementPremium', e.target.value)}
            >
              <option value="none">Hold the Line (Strike persists, Board approves, ROI = 0)</option>
              <option value="low">Negotiate (50% ROI restored, -5 Pol. Capital)</option>
              <option value="high">Platinum Settlement (Strike ends, -20 Pol. Capital, +50 Shadow Debt)</option>
              <option value="suppress">Suppress (ROI restored, -30 Pol. Capital, Adds Toxic nodes)</option>
            </select>
          </div>
        )}

        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <label className="block text-[12px] font-medium text-[var(--text)] mb-1">Departmental Merit Multipliers</label>
          <p className="text-[9px] text-amber-500/80 mb-3 italic">⚠️ Warning: Cross-departmental disparity > 2% triggers Envy resentment.</p>
          <div className="grid grid-cols-2 gap-4">
            {['Engineering', 'Sales', 'Product', 'Ops'].map(dept => (
              <div key={dept} className="flex flex-col">
                <span className="text-[10px] text-[var(--text-muted)] mb-1">{dept}</span>
                <input 
                  type="number" step="0.1"
                  className="bg-[var(--surface-alt)] border border-[var(--border)] rounded px-2 py-1 text-[11px] text-[var(--text)] font-mono"
                  placeholder="1.0x"
                  value={decisions?.deptMults?.[dept] || 1.0}
                  onChange={e => {
                    const mults = { ...(decisions.deptMults || {}) };
                    mults[dept] = Number(e.target.value);
                    update('deptMults', mults);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-muted)]">Allocate exactly 100 weighting points across performance components.</p>
        
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { id: 'wEbitda', label: 'Company EBITDA %', val: wE },
              { id: 'wDiv', label: 'Division Revenue %', val: wD },
              { id: 'wTeam', label: 'Team OKRs %', val: wT },
              { id: 'wInd', label: 'Individual Rating %', val: wI },
              { id: 'wCsat', label: 'Customer Sat (CSAT) %', val: wC },
              { id: 'wLongTerm', label: 'Long-Term Strategy %', val: wL },
            ].map(comp => (
              <div key={comp.id} className="flex justify-between items-center">
                <label className="text-[11px] text-[var(--text)]">{comp.label}</label>
                <input 
                  type="number" min="0" max="100" 
                  className="bg-[var(--surface-alt)] border border-[var(--border)] rounded px-2 py-1 text-[11px] w-16 text-[var(--text)] text-right font-mono"
                  value={comp.val}
                  onChange={e => update(comp.id, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className={`flex justify-between items-center pt-3 border-t border-[var(--border)] text-[12px] font-mono font-bold ${total === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
            <span>Total Weight</span>
            <span>{total} / 100</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[12px] font-medium text-[var(--text)] mb-1">Multiplier Curve Definition</h3>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-3">
            Define the variable payout multiplier for each performance rating tier (R1: Needs Improvement through R5: Outstanding). 
            A 1.0x curve pays target bonus. A 0.0x curve pays zero. High multipliers (e.g. 2.0x for R5) drain the budget exponentially faster.
          </p>
          <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] grid grid-cols-5 gap-2">
            {[
              { r: 1, label: 'R1 (Poor)' },
              { r: 2, label: 'R2 (Below)' },
              { r: 3, label: 'R3 (Meets)' },
              { r: 4, label: 'R4 (Exceeds)' },
              { r: 5, label: 'R5 (Outstanding)' }
            ].map(tier => (
              <div key={tier.r} className="flex flex-col items-center">
                <span className="text-[9px] text-[var(--text-muted)] mb-1 whitespace-nowrap">{tier.label}</span>
                <input 
                  type="number" step="0.1"
                  className="bg-[var(--surface-alt)] border border-[var(--border)] rounded px-1 py-1 text-[11px] w-full text-[var(--text)] text-center font-mono"
                  placeholder="1.0x"
                  value={decisions?.curve?.[tier.r] || ''}
                  onChange={e => {
                    const curve = { ...(decisions.curve || {}) };
                    curve[tier.r] = Number(e.target.value);
                    update('curve', curve);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (round === 4) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">LTI Vesting & Retention Grants</h2>
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <label className="block text-[12px] font-medium text-[var(--text)] mb-2">Company Vesting Schedule</label>
          <select 
            className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] text-[12px] rounded p-2 w-full"
            value={decisions.vestingCliff || 4}
            onChange={e => update('vestingCliff', Number(e.target.value))}
          >
            <option value={1}>1-Year Cliff + Monthly (High retention risk)</option>
            <option value={4}>4-Year Linear (Standard)</option>
            <option value={5}>Back-weighted 10/20/30/40 (IPO Protective)</option>
          </select>
        </div>
        <h3 className="text-[12px] font-medium text-[var(--text-muted)] mt-4">Targeted Pre-IPO Grants (Critical Nodes)</h3>
        {workforce.filter((e: any) => e.performance >= 4).slice(0,4).map((emp: any) => (
          <div key={emp.id} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] flex justify-between items-center">
            <div className="text-[12px] text-[var(--text)]">{emp.name}</div>
            <select 
              className="bg-[var(--surface-alt)] border border-[var(--border)] text-[11px] text-[var(--text)] rounded p-1"
              value={decisions?.ltiGrants?.[emp.id] || 0}
              onChange={e => {
                const grants = { ...(decisions.ltiGrants || {}) };
                grants[emp.id] = Number(e.target.value);
                update('ltiGrants', grants);
              }}
            >
              <option value={0}>No Grant</option>
              <option value={0.1}>Small Grant</option>
              <option value={0.3}>Major Grant</option>
              <option value={0.5}>Expat Equivalent</option>
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (round === 5) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Executive Scorecard & Sales Mix</h2>
        <LeverCard id="salesAcc" label="Sales Accelerator" description="Commission multiplier beyond 100% quota." displayValue={`${(decisions.salesAcc || 1.0)}×`}>
          <input type="range" min={1.0} max={3.0} step={0.1} value={decisions.salesAcc || 1.0} onChange={e => update('salesAcc', Number(e.target.value))} style={{ background: sliderBg(((decisions.salesAcc || 1.0) - 1.0) / 2.0) }} />
        </LeverCard>
        <LeverCard id="execPsuMix" label="Executive PSU Mix" description="Percentage of executive base converted to Performance Share Units tied to IPO valuation." displayValue={fmtPct(decisions.execPsuMix || 0.2)}>
          <input type="range" min={0} max={0.6} step={0.05} value={decisions.execPsuMix || 0.2} onChange={e => update('execPsuMix', Number(e.target.value))} style={{ background: sliderBg((decisions.execPsuMix || 0.2) / 0.6) }} />
        </LeverCard>
      </div>
    );
  }

  if (round === 6) {
    const VIPs = workforce.filter((e: any) => e.performance >= 4 && e.tier === 1).slice(0, 4);
    const budget = 2000000;
    const spent = Object.values(decisions.exceptions || {}).reduce((a: any, b: any) => a + Number(b), 0) as number;
    const remaining = budget - spent;

    return (
      <div className="space-y-5">
        <div className="flex justify-between items-end">
          <h2 className="text-[13px] font-semibold text-[var(--text)]">VP Exception Triage</h2>
          <div className="text-right">
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Remaining Discretionary Budget</div>
            <div className={`text-[14px] font-mono font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {fmtLPA(remaining)}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-muted)]">These 4 critical employees have submitted ultimatums. Allocate the remaining discretionary budget to retain them. If you overspend, you fail the IPO audit.</p>
        
        <div className="space-y-3">
          {VIPs.map((emp: any, idx: number) => {
            const quotes = [
              "I have a formal offer from a competitor that's 40% higher. Match it or I walk.",
              "My team carried the quarter. My base pay needs a structural adjustment.",
              "I'm considering relocating to Dubai for a tax-free package.",
              "The pre-IPO stress is high. I need my equity adjusted immediately."
            ];
            return (
              <div key={emp.id} className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[12px] font-medium text-[var(--text)]">{emp.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Grade: {emp.level} | Comp-Ratio: {(emp.currentPay / emp.marketMid).toFixed(2)}</div>
                  </div>
                  <input 
                    type="number" step="50000"
                    className={`bg-[var(--surface-alt)] border rounded px-2 py-1 text-[12px] w-28 text-[var(--text)] text-right font-mono ${remaining < 0 ? 'border-red-500/50' : 'border-[var(--border)]'}`}
                    placeholder="₹ Allocation"
                    value={decisions?.exceptions?.[emp.id] || ''}
                    onChange={e => {
                      const ex = { ...(decisions.exceptions || {}) };
                      ex[emp.id] = Number(e.target.value);
                      update('exceptions', ex);
                    }}
                  />
                </div>
                <div className="text-[10px] text-amber-500/90 bg-amber-500/10 px-2 py-1.5 rounded italic">
                  "{quotes[idx % quotes.length]}"
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div>Unknown Round</div>;
}
