const { workforce } = require('./indiaWorkforce');

/**
 * ELITE HR CALCULATION ENGINE (BharatQuick Edition)
 * Theories:
 * - EQUITY THEORY: Attrition risk increases if comp-ratio is lower than high-performing peers.
 * - EXPECTANCY THEORY: Motivation drops if merit increase < performance tier.
 * - AGENCY THEORY: Executive retention linked to LTI/STI balance.
 */

function calculateCompRatio(salary, marketMid) {
  return parseFloat((salary / marketMid).toFixed(2));
}

function processRound(decisions, prevMetrics, themeConfig) {
  // decisions: { meritPool: 0.1, salesAcc: 1.5, ltiMix: 0.3, parityPool: 500000, promotions: [] }
  const { meritPool = 0.08, salesAcc = 1.0, ltiMix = 0.2, parityPool = 0, promotions = [] } = decisions;

  let totalBudgetUsed = 0;
  let totalPerformanceValue = 0;
  let totalEquityDistance = 0;
  let employeeOutcomes = [];

  // Calculate Departmental Averages for Equity Theory
  const deptStats = {};
  workforce.forEach(e => {
    if (!deptStats[e.dept]) deptStats[e.dept] = { totalCR: 0, count: 0 };
    deptStats[e.dept].totalCR += calculateCompRatio(e.currentPay, e.marketMid);
    deptStats[e.dept].count++;
  });

  const cityRiskMultipliers = { 1: 1.5, 2: 1.2, 3: 1.0, 4: 0.8 };

  workforce.forEach(emp => {
    let salary = emp.currentPay;
    let cr = calculateCompRatio(salary, emp.marketMid);
    let avgDeptCR = deptStats[emp.dept].totalCR / deptStats[emp.dept].count;

    // 1. APPLY DECISIONS
    let increase = meritPool * (emp.performance / 3); // Merit Linkage
    if (promotions.includes(emp.id)) {
      increase += 0.15; // Promotion Bump
      salary *= 1.15;
    }
    salary *= (1 + increase);
    totalBudgetUsed += (salary - emp.currentPay);

    // 2. THEORY-BASED ATTRITION
    // Equity Theory: Feeling "Underpaid" compared to peers
    const equityGap = Math.max(0, avgDeptCR - cr);
    totalEquityDistance += equityGap;

    // Expectancy Theory: Link between Perf and Raise
    const expectancyGap = Math.max(0, (emp.performance / 5) - increase);

    // Market Pressure (City Tiers)
    const marketPressure = cityRiskMultipliers[emp.tier] || 1;

    // Base Risk Calibrated
    let attritionRisk = 0.05 + (equityGap * 2) + (expectancyGap * 0.5);
    attritionRisk *= marketPressure;

    // Specific Mechanics
    if (emp.type === 'sales') {
      // Sales Accelerator impact
      const salesIncentive = emp.achievement > 1 ? (salesAcc * 0.1) : 0;
      attritionRisk -= salesIncentive;
    }
    if (emp.type === 'executive') {
      // Agency Theory: LTI retention
      attritionRisk -= (ltiMix * 0.4);
    }

    attritionRisk = Math.max(0.01, Math.min(0.9, attritionRisk));

    employeeOutcomes.push({
      id: emp.id,
      newPay: Math.round(salary),
      cr: calculateCompRatio(salary, emp.marketMid),
      attritionRisk,
      performance: emp.performance
    });

    totalPerformanceValue += emp.performance * (1 - attritionRisk);
  });

  // AGGREGATE METRICS
  const avgTurnover = employeeOutcomes.reduce((acc, curr) => acc + curr.attritionRisk, 0) / workforce.length;
  const budgetUtil = (totalBudgetUsed + parityPool) / 10000000; // Scaled
  const pValue = Math.max(0.01, 0.08 + (parityPool / 1000000) - (Math.random() * 0.05));
  
  const metrics = {
    budgetUtil: parseFloat(budgetUtil.toFixed(2)),
    turnover: parseFloat(avgTurnover.toFixed(3)),
    engagement: parseFloat((1 - avgTurnover).toFixed(2)),
    pValue: parseFloat(pValue.toFixed(3)),
    roi: parseFloat((totalPerformanceValue / 50).toFixed(2)),
    outcomes: employeeOutcomes
  };

  // HES Calculation (Balanced Scorecard)
  const hesValue = (metrics.engagement * 30) + (metrics.roi * 30) + (Math.max(0, 100 - metrics.turnover * 400) * 0.2) + (metrics.pValue > 0.05 ? 20 : 5);
  
  return { 
    hes: Math.min(100, hesValue).toFixed(2), 
    metrics 
  };
}

module.exports = { processRound };
