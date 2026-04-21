function calculateHES(metrics) {
  const { budgetUtil, turnover, engagement, mci } = metrics;
  
  // Budget (30%)
  let budgetScore = 0;
  if (budgetUtil >= 0.9 && budgetUtil <= 1.0) budgetScore = 100;
  else if (budgetUtil >= 0.8 && budgetUtil < 0.9) budgetScore = 70;
  else if (budgetUtil > 1.0 && budgetUtil <= 1.03) budgetScore = 85;
  else if (budgetUtil > 1.03) budgetScore = 40;
  else if (budgetUtil < 0.8) budgetScore = 55;

  // Turnover (25%)
  let turnoverScore = 100 - (turnover * 8 * 100);
  if (turnoverScore < 0) turnoverScore = 0;
  if (turnover > 0.125) turnoverScore = 0;

  // Engagement (25%)
  let engScore = engagement * 100;

  // Market Competitiveness Score (20%)
  let mciScore = 0;
  if (mci >= 0.5 && mci <= 0.6) mciScore = 100;
  else if (mci >= 0.4 && mci < 0.5) mciScore = 75;
  else if (mci > 0.6 && mci <= 0.70) mciScore = 80;
  else if (mci < 0.4) mciScore = 50;
  else if (mci > 0.75) mciScore = 60;

  const total = (0.30 * budgetScore) + (0.25 * turnoverScore) + (0.25 * engScore) + (0.20 * mciScore);
  return total.toFixed(2);
}

function processRound(decisions, themeConfig) {
  // Mock processing logic based on student decisions
  // decisions = { basePayAdj, variablePay, benefits, equityAdj, communication }
  
  let budgetUtil = 0.95 + (decisions.basePayAdj * 0.5) + (decisions.variablePay * 0.2);
  let turnover = 0.05 - (decisions.basePayAdj * 0.1) + (decisions.benefits === 'high' ? -0.02 : 0.02);
  let engagement = 0.7 + (decisions.communication * 0.1) + (decisions.benefits === 'high' ? 0.1 : 0);
  let mci = 0.5 + (decisions.basePayAdj * 0.2);

  // Bounds
  turnover = Math.max(0, Math.min(turnover, 1));
  engagement = Math.max(0, Math.min(engagement, 1));

  const metrics = { budgetUtil, turnover, engagement, mci };
  const hes = calculateHES(metrics);

  return { hes, metrics };
}

module.exports = { calculateHES, processRound };
