/**
 * ENTROPY ENGINE (Executive Tier)
 * Stochastic Mutating Engine with Grapevine Graph processing
 */

function calculateCompRatio(salary, marketMid) {
  return parseFloat((salary / marketMid).toFixed(2));
}

function calculateEnvyDelta(emp, workforce) {
  // The Envy Variable (delta)
  let envy = 0;
  if (!emp.connections || emp.connections.length === 0) return 0;
  
  const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
  
  emp.connections.forEach(peerId => {
    const peer = workforce.find(w => w.id === peerId);
    if (!peer) return;
    
    const peerCR = calculateCompRatio(peer.currentPay, peer.marketMid);
    // If peer is earning more (relative to market) but performing same or worse
    if (peerCR > cr + 0.05 && peer.truePerformance <= emp.truePerformance) {
      envy += (peerCR - cr) * 2.0; // High exponential sensitivity to peer inequity
    }
  });
  
  return Math.min(envy, 0.8); // Max 80% envy penalty
}

function processRound(decisions, rawWorkforce, round, sessionState) {
  let workforce = JSON.parse(JSON.stringify(rawWorkforce));
  const { workforce: masterWorkforce } = require('./indiaWorkforce');

  // Backfill connections
  workforce.forEach(emp => {
    if (!emp.connections) {
      const masterEmp = masterWorkforce.find(w => w.id === emp.id);
      emp.connections = masterEmp ? (masterEmp.connections || []) : [];
    }
    // Default truePerformance to performance if missing
    if (emp.truePerformance === undefined) emp.truePerformance = emp.performance;
  });

  // --- ENTROPY MECHANIC: Toxic Degradation ---
  const toxicNodes = workforce.filter(w => w.isToxic);
  if (toxicNodes.length > 0) {
    toxicNodes.forEach(toxicEmp => {
      toxicEmp.connections.forEach(peerId => {
        const peer = workforce.find(w => w.id === peerId);
        if (peer && peer.truePerformance > 1) {
          peer.truePerformance -= 0.5; // Toxic cancer reduces true performance
          peer.performance = Math.max(1, Math.floor(peer.truePerformance));
        }
      });
    });
  }

  let totalBudgetUsed = 0;
  let totalPerformanceValue = 0;
  let totalEquityDistance = 0;
  let shadowDebtAdded = 0;

  // --- ROUND 1: Job Slotting & Equity ---
  if (round === 1) {
    if (decisions.equityAllocations) {
      Object.entries(decisions.equityAllocations).forEach(([id, amt]) => {
        const amount = Number(amt) || 0;
        const emp = workforce.find(w => w.id === id);
        if (emp && amount > 0) {
          emp.currentPay += amount;
          // ENTROPY MECHANIC: Shadow Comp Debt (Discretionary cash raises floor permanently)
          shadowDebtAdded += amount;
        }
      });
    }
  }

  // --- ROUND 2: Geo-Tiering & Benchmarking ---
  if (round === 2) {
    const percentileMod = decisions.targetPercentile === 75 ? 1.15 : (decisions.targetPercentile === 90 ? 1.3 : 1.0);
    workforce.forEach(emp => {
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
        // Use truePerformance for actual payouts, though UI might show biased
        payout = decisions.curve[Math.floor(emp.truePerformance).toString()] || 1.0;
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
    
    // ENTROPY MECHANIC: Skill Half-Life (Productivity drops if no LTI or promo given)
    workforce.forEach(emp => {
      if (!emp.lti && emp.truePerformance > 1) {
        emp.truePerformance *= 0.88; // 12% decay
        emp.performance = Math.max(1, Math.floor(emp.truePerformance));
      }
    });
  }

  // --- ROUND 5: Variable Payout Execution ---
  if (round === 5) {
    workforce.forEach(emp => {
      if (emp.projectedBonusMultiplier) {
        const bonusTarget = emp.currentPay * 0.15; 
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
        if (emp && amount > 0) {
          emp.currentPay += amount;
          shadowDebtAdded += amount;
        }
      });
    }

    if (exceptionsCost > 2000000) {
      // Board Governance Failure
      workforce.forEach(emp => {
        if (emp.tier === 1 && emp.lti > 0) emp.lti = 0;
      });
      if (sessionState) sessionState.politicalCapital -= 50;
    }
  }

  if (sessionState && shadowDebtAdded > 0) {
    sessionState.shadowDebt += shadowDebtAdded;
  }

  const deptStats = {};
  let lowTierCRSum = 0;
  let lowTierCount = 0;

  workforce.forEach(emp => {
    if (!deptStats[emp.dept]) deptStats[emp.dept] = { totalCR: 0, count: 0 };
    const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
    deptStats[emp.dept].totalCR += cr;
    deptStats[emp.dept].count += 1;
    
    // Unionization check tracking
    if (emp.level === 'P1' || emp.level === 'P2') {
      lowTierCRSum += cr;
      lowTierCount++;
    }
  });

  // --- ENTROPY MECHANIC: Unionization Risk ---
  let isUnionStriking = false;
  if (lowTierCount > 0 && (lowTierCRSum / lowTierCount) < 0.80) {
    isUnionStriking = true;
    if (sessionState) sessionState.isUnionStriking = true;
  }

  let employeeOutcomes = [];

  workforce.forEach(emp => {
    const cr = calculateCompRatio(emp.currentPay, emp.marketMid);
    let avgDeptCR = deptStats[emp.dept].totalCR / deptStats[emp.dept].count;
    
    totalBudgetUsed += emp.currentPay;
    const equityGap = Math.max(0, avgDeptCR - cr);
    totalEquityDistance += equityGap;
    
    // ENTROPY MECHANIC: Utility Function (Ue)
    const alphaPay = cr;
    const betaEquity = (emp.lti || 0) * 2;
    const gammaGrowth = emp.projectedBonusMultiplier ? emp.projectedBonusMultiplier * 0.2 : 0;
    const deltaEnvy = calculateEnvyDelta(emp, workforce);
    
    const utilityUe = alphaPay + betaEquity + gammaGrowth - deltaEnvy;
    emp.utilityUe = utilityUe;

    // Negative utility = Quiet Quitting (Performance drops)
    if (utilityUe < 0.8) {
      emp.truePerformance = Math.max(1, emp.truePerformance - 0.5);
    }

    // Attrition Risk is inversely proportional to Utility
    let attritionRisk = Math.max(0, 1.2 - utilityUe);

    attritionRisk = Math.max(0.01, Math.min(0.95, attritionRisk));

    employeeOutcomes.push({
      id: emp.id,
      newPay: emp.currentPay,
      cr: cr,
      attritionRisk,
      truePerformance: emp.truePerformance,
      envy: deltaEnvy
    });

    totalPerformanceValue += emp.truePerformance * (1 - attritionRisk);
  });

  // If Union is striking, ROI plummets to 0
  if (isUnionStriking) totalPerformanceValue = 0;

  const avgTurnover = employeeOutcomes.reduce((acc, curr) => acc + curr.attritionRisk, 0) / workforce.length;
  const pValue = Math.max(0.01, 0.08 - totalEquityDistance * 0.01);
  
  const metrics = {
    budgetUtil: parseFloat((totalBudgetUsed / 10000000).toFixed(2)),
    turnover: parseFloat(avgTurnover.toFixed(3)),
    engagement: parseFloat((1 - avgTurnover).toFixed(2)),
    pValue: parseFloat(pValue.toFixed(3)),
    roi: parseFloat((totalPerformanceValue / workforce.length).toFixed(2)),
    outcomes: employeeOutcomes
  };

  // --- ENTROPY MECHANIC: X-HES (Executive HES) ---
  // Baseline EBITDA (Conceptual)
  const EBITDA = 15000000; 
  const TCOW = totalBudgetUsed;
  const WACCHaircut = Math.max(0, (TCOW - EBITDA) / 1000000); // Penalty for overspending base
  
  const shadowDebtPenalty = (sessionState?.shadowDebt || 0) / 500000; 
  const zombiePenalty = avgTurnover < 0.02 ? 15 : 0; // Penalize 0% turnover (harboring zombies)

  const valueCreated = (metrics.roi / 5) * 60; // Max 60
  const riskAdjustedTCOW = 1 + WACCHaircut;

  const govScore = (sessionState?.politicalCapital || 100) / 100;
  
  let xHesValue = ((valueCreated - shadowDebtPenalty) / riskAdjustedTCOW) * govScore * 100;
  
  // Apply zombie penalty and normalizer
  xHesValue = xHesValue - zombiePenalty;
  
  // Normalize so mean is roughly 50. Max 100, Min 0.
  xHesValue = Math.max(0, Math.min(100, (xHesValue * 0.75) + 20));

  // Auto Fired
  if (sessionState && sessionState.politicalCapital <= 0) {
    sessionState.isFired = true;
    xHesValue = 0;
  }
  
  return { 
    hes: xHesValue.toFixed(2), 
    metrics,
    updatedWorkforce: workforce
  };
}

module.exports = { processRound };
