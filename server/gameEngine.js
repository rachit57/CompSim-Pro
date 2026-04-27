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

function processRound(decisions, rawWorkforce, round) {
  // Deep clone to force React to recognize state changes on the client
  let workforce = JSON.parse(JSON.stringify(rawWorkforce));
  const { workforce: masterWorkforce } = require('./indiaWorkforce');

  // Backfill connections if the session is old/cached
  workforce.forEach(emp => {
    if (!emp.connections) {
      const masterEmp = masterWorkforce.find(w => w.id === emp.id);
      emp.connections = masterEmp ? (masterEmp.connections || []) : [];
    }
  });

  let totalBudgetUsed = 0;
  let totalPerformanceValue = 0;
  let totalEquityDistance = 0;

  // Track the delta for reporting
  let budgetDelta = 0;

  // --- ROUND 1: Job Slotting & Equity ---
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
  if (round === 2) {
    const percentileMod = decisions.targetPercentile === 75 ? 1.15 : (decisions.targetPercentile === 90 ? 1.3 : 1.0);
    workforce.forEach(emp => {
      // Adjust baseline market median
      if (emp.tier === 2) emp.marketMid = Math.round(emp.marketMid * (decisions.tier2Mult || 0.8) * percentileMod);
      else if (emp.tier >= 3) emp.marketMid = Math.round(emp.marketMid * (decisions.tier3Mult || 0.6) * percentileMod);
      else emp.marketMid = Math.round(emp.marketMid * percentileMod);
    });
  }

  // --- ROUND 3: Advanced Formula Making ---
  if (round === 3) {
    const totalWeight = (decisions.wEbitda || 0) + (decisions.wDiv || 0) + (decisions.wInd || 0) + (decisions.wTeam || 0) + (decisions.wCsat || 0) + (decisions.wLongTerm || 0);
    const valid = totalWeight === 100;
    
    workforce.forEach(emp => {
      let payout = 1.0;
      if (valid && decisions.curve) {
        payout = decisions.curve[emp.performance.toString()] || 1.0;
      }
      emp.projectedBonusMultiplier = payout;
    });
  }

  // --- ROUND 4: LTI Vesting ---
  if (round === 4) {
    if (decisions.ltiGrants) {
      Object.entries(decisions.ltiGrants).forEach(([id, amt]) => {
        const emp = workforce.find(w => w.id === id);
        if (emp) emp.lti = (emp.lti || 0) + amt;
      });
    }
  }

  // --- ROUND 5: Variable Payout Execution ---
  if (round === 5) {
    workforce.forEach(emp => {
      if (emp.projectedBonusMultiplier) {
        // Apply variable bonus to current pay for this quarter
        const bonusTarget = emp.currentPay * 0.15; // Assume 15% target
        emp.currentPay += (bonusTarget * emp.projectedBonusMultiplier);
      }
    });
  }

  // --- ROUND 6: Exception Triage & Hard Budget ---
  if (round === 6) {
    let exceptionsCost = 0;
    if (decisions.exceptions) {
      Object.entries(decisions.exceptions).forEach(([id, amt]) => {
        const amount = Number(amt) || 0;
        exceptionsCost += amount;
        const emp = workforce.find(w => w.id === id);
        if (emp) {
          emp.currentPay += amount;
        }
      });
    }

    // STRICT BUDGET ENFORCEMENT: Max ₹20L allowed
    if (exceptionsCost > 2000000) {
      // PENALTY: Wipe out executive LTI due to board governance failure
      workforce.forEach(emp => {
        if (emp.tier === 1 && emp.lti > 0) {
          emp.lti = 0; // Seized by board
        }
      });
    }
  }

  // Calculate Metrics based on mutated state
  const deptStats = {};
  workforce.forEach(emp => {
    if (!deptStats[emp.dept]) deptStats[emp.dept] = { totalCR: 0, count: 0 };
    const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
    deptStats[emp.dept].totalCR += cr;
    deptStats[emp.dept].count += 1;
  });

  const cityRiskMultipliers = {
    1: 1.2, // Tier 1 flight risk higher
    2: 1.0,
    3: 0.8
  };

  let employeeOutcomes = [];

  workforce.forEach(emp => {
    const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
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
    budgetUtil: parseFloat((totalBudgetUsed / 10000000).toFixed(2)),
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
