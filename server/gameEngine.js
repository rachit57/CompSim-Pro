/**
 * ELITE HR CALCULATION ENGINE (BharatQuick Edition)
 * Stateful Mutating Engine with Grapevine Graph processing
 */

function calculateCompRatio(salary, marketMid) {
  return parseFloat((salary / marketMid).toFixed(2));
}

function calculateGrapevinePenalty(emp, workforce) {
  // Finds connected peers and applies penalty if peer has same/lower performance but significantly higher Comp-Ratio
  let penalty = 0;
  if (!emp.connections || emp.connections.length === 0) return 0;
  
  const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
  
  emp.connections.forEach(peerId => {
    const peer = workforce.find(w => w.id === peerId);
    if (!peer) return;
    
    const peerCR = calculateCompRatio(peer.currentPay, peer.marketMid);
    // If peer is earning more (relative to market) but performing same or worse
    if (peerCR > cr + 0.1 && peer.performance <= emp.performance) {
      penalty += (peerCR - cr) * 1.5; // High sensitivity to peer inequity
    }
  });
  
  return Math.min(penalty, 0.4); // Max 40% added risk from peer envy
}

function processRound(decisions, workforce, round) {
  let totalBudgetUsed = 0;
  let totalPerformanceValue = 0;
  let totalEquityDistance = 0;

  // Track the delta for reporting
  let budgetDelta = 0;

  // --- ROUND 1: Job Slotting & Equity ---
  // decisions: { equityAllocations: { 'N5': 150000 } }
  if (round === 1) {
    if (decisions.equityAllocations) {
      Object.entries(decisions.equityAllocations).forEach(([id, amt]) => {
        const emp = workforce.find(w => w.id === id);
        if (emp) {
          emp.currentPay += amt;
          budgetDelta += amt;
        }
      });
    }
  }

  // --- ROUND 2: Geo-Tiering & Benchmarking ---
  // decisions: { targetPercentile: 50, tier2Mult: 0.8, tier3Mult: 0.6 }
  if (round === 2) {
    const percentileMod = decisions.targetPercentile === 75 ? 1.15 : (decisions.targetPercentile === 90 ? 1.3 : 1.0);
    workforce.forEach(emp => {
      let originalMid = emp.marketMid;
      // Adjust baseline market median
      if (emp.tier === 2) emp.marketMid = Math.round(emp.marketMid * (decisions.tier2Mult || 0.8) * percentileMod);
      else if (emp.tier >= 3) emp.marketMid = Math.round(emp.marketMid * (decisions.tier3Mult || 0.6) * percentileMod);
      else emp.marketMid = Math.round(emp.marketMid * percentileMod);
    });
  }

  // --- ROUND 3: Formula Making ---
  // decisions: { thresh: 0.8, max: 2.0, ebitdaWeight: 0.6, divWeight: 0.2, indWeight: 0.2 }
  // We just save the formula in the session (or apply a conceptual bonus flag)
  if (round === 3) {
    workforce.forEach(emp => {
      // Simulate applying the formula
      let payout = 1.0;
      if (emp.performance === 5) payout = decisions.max || 1.5;
      if (emp.performance <= 2) payout = decisions.thresh || 0;
      emp.projectedBonusMultiplier = payout;
    });
  }

  // --- ROUND 4: LTI Vesting ---
  // decisions: { ltiGrants: { 'E1': 0.1 }, vestingCliff: 4 }
  if (round === 4) {
    if (decisions.ltiGrants) {
      Object.entries(decisions.ltiGrants).forEach(([id, amt]) => {
        const emp = workforce.find(w => w.id === id);
        if (emp) emp.lti = (emp.lti || 0) + amt;
      });
    }
  }

  // --- ROUND 5: Sales/Exec Alignment ---
  // decisions: { salesAcc: 1.5, execPsuMix: 0.5 }
  if (round === 5) {
    workforce.forEach(emp => {
      if (emp.type === 'sales') emp.accelerator = decisions.salesAcc || 1.0;
      if (emp.type === 'executive') emp.sto = decisions.execPsuMix || 0.2;
    });
  }

  // --- ROUND 6: Merit Grid ---
  // decisions: { meritMatrix: { '5': 0.15, '4': 0.08, '3': 0.04 } }
  if (round === 6) {
    const grid = decisions.meritMatrix || { '5': 0.1, '4': 0.05, '3': 0.0 };
    workforce.forEach(emp => {
      const increase = grid[emp.performance.toString()] || 0;
      const amount = emp.currentPay * increase;
      emp.currentPay += amount;
      budgetDelta += amount;
    });
  }

  // Calculate Departmental Averages
  const deptStats = {};
  workforce.forEach(e => {
    if (!deptStats[e.dept]) deptStats[e.dept] = { totalCR: 0, count: 0 };
    deptStats[e.dept].totalCR += calculateCompRatio(e.currentPay, e.marketMid);
    deptStats[e.dept].count++;
  });

  // Calculate Final Outcomes & Risks
  let employeeOutcomes = [];
  const cityRiskMultipliers = { 1: 1.5, 2: 1.2, 3: 1.0, 4: 0.8 };

  workforce.forEach(emp => {
    let cr = calculateCompRatio(emp.currentPay, emp.marketMid);
    let avgDeptCR = deptStats[emp.dept].totalCR / deptStats[emp.dept].count;
    
    totalBudgetUsed += emp.currentPay;

    // Base Attrition Factors
    const equityGap = Math.max(0, avgDeptCR - cr);
    totalEquityDistance += equityGap;
    
    let attritionRisk = 0.05 + (equityGap * 1.5);
    attritionRisk *= (cityRiskMultipliers[emp.tier] || 1);

    // Grapevine Network Penalty
    const grapevinePenalty = calculateGrapevinePenalty(emp, workforce);
    attritionRisk += grapevinePenalty;

    // LTI lock-in reduction
    if (emp.lti > 0) attritionRisk -= (emp.lti * 0.5);
    
    // Performance alignment reduction
    if (emp.projectedBonusMultiplier && emp.projectedBonusMultiplier > 1.2) attritionRisk -= 0.1;

    attritionRisk = Math.max(0.01, Math.min(0.95, attritionRisk));

    employeeOutcomes.push({
      id: emp.id,
      newPay: emp.currentPay,
      cr: cr,
      attritionRisk,
      performance: emp.performance,
      grapevineActive: grapevinePenalty > 0.05
    });

    totalPerformanceValue += emp.performance * (1 - attritionRisk);
  });

  const avgTurnover = employeeOutcomes.reduce((acc, curr) => acc + curr.attritionRisk, 0) / workforce.length;
  // Compute basic pValue approximation based on CR variance
  const crVariance = Math.random() * 0.05; // Simplified for now
  const pValue = Math.max(0.01, 0.08 - totalEquityDistance * 0.01 + crVariance);
  
  const metrics = {
    budgetUtil: parseFloat((totalBudgetUsed / 100000000).toFixed(2)),
    turnover: parseFloat(avgTurnover.toFixed(3)),
    engagement: parseFloat((1 - avgTurnover).toFixed(2)),
    pValue: parseFloat(pValue.toFixed(3)),
    roi: parseFloat((totalPerformanceValue / workforce.length).toFixed(2)),
    outcomes: employeeOutcomes
  };

  const hesValue = (metrics.engagement * 30) + (metrics.roi * 30) + (Math.max(0, 100 - metrics.turnover * 400) * 0.2) + (metrics.pValue > 0.05 ? 20 : 5);
  
  return { 
    hes: Math.min(100, hesValue).toFixed(2), 
    metrics,
    updatedWorkforce: workforce
  };
}

module.exports = { processRound };
