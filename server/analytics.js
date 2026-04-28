/**
 * CompSim Pro Analytics Engine
 * Calculates cohort distributions and generates narrative feedback.
 */

function calculateCohortStats(players) {
  const scores = players.map(p => p.score || 0).sort((a, b) => a - b);
  const n = scores.length;
  
  if (n === 0) return null;

  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  
  const sqDiffs = scores.map(s => Math.pow(s - mean, 2));
  const stdDev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / n);

  // Simple Normal Distribution Bins
  const bins = { '0-40': 0, '41-60': 0, '61-80': 0, '81-90': 0, '91-100': 0 };
  scores.forEach(s => {
    if (s <= 40) bins['0-40']++;
    else if (s <= 60) bins['41-60']++;
    else if (s <= 80) bins['61-80']++;
    else if (s <= 90) bins['81-90']++;
    else bins['91-100']++;
  });

  return { mean, stdDev, bins, count: n };
}

function generateNarrativeFeedback(player) {
  const { score, metrics, politicalCapital, shadowDebt } = player;
  let feedback = `Your final HES Score: ${score}\n\n`;

  if (score >= 90) {
    feedback += "EXECUTIVE SUMMARY: You demonstrated master-class leadership in compensation strategy. ";
  } else if (score >= 70) {
    feedback += "EXECUTIVE SUMMARY: You maintained a stable corporate structure, though some efficiency was lost. ";
  } else {
    feedback += "EXECUTIVE SUMMARY: Your tenure was marked by significant governance risks and talent flight. ";
  }

  // ROI Logic
  if (metrics.roi > 0.8) {
    feedback += "\n- ROI: Exceptional budget utilization. You maximized performance per rupee spent.";
  } else {
    feedback += "\n- ROI: Budget leakage detected. Your spend-to-performance ratio was sub-optimal.";
  }

  // Governance Logic
  if (politicalCapital < 30) {
    feedback += "\n- GOVERNANCE: Critical Warning. You nearly lost board confidence due to aggressive cost-cutting.";
  } else if (shadowDebt > 100) {
    feedback += "\n- FISCAL: High Shadow Debt. Your short-term retention wins created long-term balance sheet liabilities.";
  }

  feedback += "\n\nRecommendations: Focus on balancing the 'Envy Delta' across departments in future simulations.";
  
  return feedback;
}

module.exports = { calculateCohortStats, generateNarrativeFeedback };
