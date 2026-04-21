/**
 * MBA-HR Strategic Calculation Engine
 * 
 * Metrics:
 * - HES (Human Equity Score): Strategic success indicator (0-100)
 * - P-Value: Statistical significance of pay parity gaps (warning < 0.05)
 * - Attrition Risk: Probability of persona turnover
 */

function calculateParityPValue(decisions) {
  // Simulates a t-test result for gender/race pay gaps.
  // Higher "Equality Debt" from previous rounds or low "D&I Investment" drops the p-value.
  const parityInvestment = decisions.parityAdj || 0;
  const baseRisk = 0.08; // Normal variation
  const pValue = Math.max(0.001, baseRisk + (parityInvestment * 2) - (Math.random() * 0.05));
  return parseFloat(pValue.toFixed(3));
}

function calculateHES(metrics) {
  const { budgetUtil, turnover, engagement, pValue, roi } = metrics;
  
  // Parity Penalty
  const parityPenalty = pValue < 0.05 ? 40 : 0;
  
  // Budget Variance (Peak at 98% utilization)
  let budgetScore = 100 - Math.abs(0.98 - budgetUtil) * 500;
  budgetScore = Math.max(0, Math.min(100, budgetScore));

  const total = (0.35 * budgetScore) + (0.25 * engagement * 100) + (0.20 * (100 - turnover * 100)) + (0.20 * roi * 100) - parityPenalty;
  return Math.max(0, Math.min(100, total)).toFixed(2);
}

function processRound(decisions, prevMetrics, themeConfig) {
  // 4 Personas: Tech, Leadership, Mid-Level, Junior
  const { basePayAdj, variablePay, benefits, parityAdj } = decisions;
  
  // MBA Level Logic: Different reward mixes attract different personas
  // Tech: Sensitive to Base Pay & Variable Pay
  // Leadership: Sensitive to variable pay (LTI/Options)
  // Junior: Sensitive to wellbeing & growth
  
  const basePayWeight = themeConfig.industryModifiers.basePayImportance || 1;
  
  // 1. Calculate Attrition Risk per Persona
  const personaRisk = {
    tech: Math.max(0.02, 0.15 - (basePayAdj * 0.8) - (variablePay * 0.2)),
    leadership: Math.max(0.01, 0.08 - (variablePay * 1.5)),
    junior: Math.max(0.05, 0.20 - (basePayAdj * 0.2) - (benefits === 'premium' ? 0.1 : 0.02))
  };

  const avgTurnover = (personaRisk.tech + personaRisk.leadership + personaRisk.junior) / 3;
  const engagement = 0.6 + (basePayAdj * 0.5) + (benefits === 'premium' ? 0.2 : 0);
  const budgetUtil = 0.90 + (basePayAdj * 0.6) + (variablePay * 0.3) + (parityAdj * 0.2);
  const pValue = calculateParityPValue(decisions);
  const roi = 0.5 + (engagement * 0.4) - (avgTurnover * 0.5);

  const metrics = { 
    budgetUtil: parseFloat(budgetUtil.toFixed(2)), 
    turnover: parseFloat(avgTurnover.toFixed(3)), 
    engagement: parseFloat(Math.min(1, engagement).toFixed(2)), 
    pValue,
    roi: parseFloat(Math.min(1, roi).toFixed(2)),
    personaRisk
  };

  const hes = calculateHES(metrics);

  return { hes, metrics };
}

module.exports = { calculateHES, processRound, calculateParityPValue };
