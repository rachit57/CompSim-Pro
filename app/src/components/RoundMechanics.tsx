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
      <div className="space-y-4">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Job Slotting & Equity Adjustments</h2>
        <p className="text-[11px] text-[var(--text-muted)] mb-4">Target critical flight-risks identified in the Grapevine network. Assign immediate INR adjustments to retain key acquired talent.</p>
        
        {workforce.slice(0, 5).map((emp: any) => (
          <div key={emp.id} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] flex justify-between items-center">
            <div>
              <div className="text-[12px] font-medium text-[var(--text)]">{emp.name} ({emp.role})</div>
              <div className="text-[10px] text-[var(--text-muted)]">CTC: {fmtLPA(emp.currentPay)} | Perf: {emp.performance}/5</div>
            </div>
            <div>
              <input 
                type="number" 
                step={50000}
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
          </div>
        ))}
      </div>
    );
  }

  if (round === 2) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Geo-Tiering & Benchmarking</h2>
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <label className="block text-[12px] font-medium text-[var(--text)] mb-2">Target Market Percentile (Company-wide)</label>
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
        <LeverCard id="tier2" label="Tier 2 City Multiplier" description="Baseline pay reduction for Tier 2 hubs (e.g. Pune, Hyderabad) compared to Tier 1." displayValue={`${(decisions.tier2Mult || 0.8) * 100}%`}>
          <input type="range" min={0.5} max={1.0} step={0.05} value={decisions.tier2Mult || 0.8} onChange={e => update('tier2Mult', Number(e.target.value))} style={{ background: sliderBg(((decisions.tier2Mult || 0.8) - 0.5) / 0.5) }} />
        </LeverCard>
        <LeverCard id="tier3" label="Tier 3 City Multiplier" description="Baseline pay reduction for Tier 3 hubs (e.g. Jaipur, Kochi)." displayValue={`${(decisions.tier3Mult || 0.6) * 100}%`}>
          <input type="range" min={0.3} max={0.9} step={0.05} value={decisions.tier3Mult || 0.6} onChange={e => update('tier3Mult', Number(e.target.value))} style={{ background: sliderBg(((decisions.tier3Mult || 0.6) - 0.3) / 0.6) }} />
        </LeverCard>
      </div>
    );
  }

  if (round === 3) {
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Variable Pay Formula (Merit Matrix)</h2>
        <LeverCard id="thresh" label="Threshold Payout (Rating ≤ 2)" description="Multiplier awarded to low performers." displayValue={`${(decisions.thresh || 0)}×`}>
          <input type="range" min={0} max={0.5} step={0.1} value={decisions.thresh || 0} onChange={e => update('thresh', Number(e.target.value))} style={{ background: sliderBg((decisions.thresh || 0) / 0.5) }} />
        </LeverCard>
        <LeverCard id="max" label="Max Accelerator (Rating = 5)" description="Maximum multiplier awarded to top talent." displayValue={`${(decisions.max || 1.5)}×`}>
          <input type="range" min={1.0} max={2.5} step={0.1} value={decisions.max || 1.5} onChange={e => update('max', Number(e.target.value))} style={{ background: sliderBg(((decisions.max || 1.5) - 1.0) / 1.5) }} />
        </LeverCard>
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
          <label className="block text-[12px] font-medium text-[var(--text)] mb-2">Compa-Ratio Catchup Strategy</label>
          <select 
            className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] text-[12px] rounded p-2 w-full"
            value={decisions.crStrategy || 'none'}
            onChange={e => update('crStrategy', e.target.value)}
          >
            <option value="none">Flat Distribution</option>
            <option value="moderate">Moderate Catch-up (Higher % to lower CRs)</option>
            <option value="aggressive">Aggressive Parity (Heavily penalize high CRs)</option>
          </select>
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
    return (
      <div className="space-y-5">
        <h2 className="text-[13px] font-semibold text-[var(--text)]">Final Merit Grid & Exception Triage</h2>
        <p className="text-[11px] text-[var(--text-muted)]">Your formula generated the matrix below. You must now process VP exceptions.</p>
        
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-left text-[11px] text-[var(--text)]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="pb-2">Performance</th>
                <th className="pb-2">Suggested Merit Increase</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2">5 - Outstanding</td>
                <td className="py-2 text-emerald-400 font-mono">15%</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2">4 - Exceeds</td>
                <td className="py-2 text-emerald-400 font-mono">8%</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2">3 - Meets</td>
                <td className="py-2 text-amber-400 font-mono">4%</td>
              </tr>
              <tr>
                <td className="py-2">≤ 2 - Below</td>
                <td className="py-2 text-red-400 font-mono">0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <div>Unknown Round</div>;
}
