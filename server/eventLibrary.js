const challenges = [
  {
    id: 'intro_round',
    title: 'The Baseline Strategy',
    round: 1,
    description: 'The Board has authorized a "Strategic Review." You must balance the budget while stabilizing initial churn in the Tech Stars segment.',
    story: "Welcome, Chief Reward Officer. The economy is in a 'Goldilocks' phase, but rumors of a competitor poaching spree are surfacing. This round is your 'Calibration Phase.' Set the foundation.",
    options: [
      { id: 'A', text: 'Conservative (Save for Storms)', impact: { budget: 0.92, turnover: 0.08, engagement: 0.65 } },
      { id: 'B', text: 'Balanced Positioning', impact: { budget: 0.95, turnover: 0.05, engagement: 0.75 } }
    ]
  },
  {
    id: 'poach_tech',
    title: 'The Silicon Poaching Strike',
    round: 2,
    description: 'A global competitor has opened a local hub and is offering your "Tech Stars" a 40% jump in base pay.',
    story: "URGENT MEMO: 'TechTalent Inc' just leased the building across the street. Glassdoor chatter indicates your engineers are already interviewing. You need a retention strike immediately.",
    options: [
      { id: 'A', text: 'Match Market (Budget -15%)', impact: { budget: -0.15, turnover: -0.05, engagement: 0.05 } },
      { id: 'B', text: 'Accelerate LTI Vesting', impact: { budget: 0, turnover: -0.02, engagement: 0.08 } },
      { id: 'C', text: 'Accept Managed Attrition', impact: { budget: 0.1, turnover: 0.12, engagement: -0.1 } }
    ]
  },
  {
    id: 'board_audit',
    title: 'The Strategic Board Audit',
    round: 3,
    description: 'The Board of Directors is questioning your "Market Position." Defend your budget by identifying the core metric used to measure employee pay vs. market.',
    isFormula: true,
    formulaMetric: 'Comp-Ratio',
    story: "BOARD REQ: 'We are spending millions. Prove to us that our Pay ranges are actually aligned with the market. What index are you using to track this?'",
    options: [
      { id: 'A', text: 'Comp-Ratio (Internal / Market Mid)', correct: true, impact: { engagement: 0.1, budget: 0.05 } },
      { id: 'B', text: 'Revenue Per Head', correct: false, impact: { engagement: -0.1, budget: -0.05 } },
      { id: 'C', text: 'Retention Coefficient', correct: false, impact: { engagement: -0.05, budget: -0.02 } }
    ]
  },
  {
    id: 'equity_audit',
    title: 'External Pay Equity Wave',
    round: 4,
    description: 'A whistleblower report has triggered a regulatory audit of your gender pay gap.',
    story: "NEWS ALERT: 'Equal Pay Act Compliance' is the top headline today. The Audit team is in the lobby. If your P-Value is below 0.05, you face significant fines.",
    options: [
      { id: 'A', text: 'Total Correction (Budget -12%)', impact: { pValue: 0.15, budget: -0.12, engagement: 0.1 } },
      { id: 'B', text: 'Legal Defense', impact: { pValue: -0.05, budget: -0.1, engagement: -0.1 } },
      { id: 'C', text: 'Internal Comms Spin', impact: { pValue: 0.02, budget: -0.02, engagement: 0.05 } }
    ]
  },
  {
    id: 'union_drive',
    title: 'The Blue-Collar Drive',
    round: 5,
    description: 'The manufacturing segment is organizing for better healthcare benefits.',
    story: "MESSAGE FROM FIELD: 'We are seeing picketing at the warehouse.' The Junior Analysts are siding with the workers. If you don't adjust benefits now, a strike is imminent.",
    options: [
      { id: 'A', text: 'Upgrade Health Tier (Budget -10%)', impact: { budget: -0.1, engagement: 0.15, pValue: 0.02 } },
      { id: 'B', text: 'Offer Remote Flexibility', impact: { budget: 0, engagement: 0.05, turnover: 0.1 } },
      { id: 'C', text: 'Hardline Stance', impact: { budget: 0.15, engagement: -0.25, turnover: 0.2 } }
    ]
  },
  {
    id: 'final_reckoning',
    title: 'The CEO Reckoning',
    round: 6,
    description: 'Profit margins are thinning. The CEO demands a final "Efficiency Strategy" to close the year.',
    story: "FINAL YEAR MEMO: 'We have survived the year. Now, we must optimize for the long term. Is our human equity score competitive?'",
    options: [
      { id: 'A', text: 'Profit Share Distribution', impact: { budget: -0.1, engagement: 0.2, roi: 0.1 } },
      { id: 'B', text: 'Freeze All Pay Increases', impact: { budget: 0.2, engagement: -0.15, turnover: 0.1 } },
      { id: 'C', text: 'Balanced Strategic Exit', impact: { budget: 0.05, engagement: 0.05, pValue: 0.05 } }
    ]
  }
];

const personas = {
  tech: {
    title: 'Tech Stars',
    count: 200,
    avgPay: 150000,
    chatter: 'The market for full-stack leads is exploding. Why stay here?',
    priority: 'Base Pay & Growth'
  },
  leader: {
    title: 'Executive Leadership',
    count: 40,
    avgPay: 450000,
    chatter: 'The variable component is too low; we need more skin in the game.',
    priority: 'Variable Pay (LTI/Bonus)'
  },
  junior: {
    title: 'Junior Analysts',
    count: 800,
    avgPay: 65000,
    chatter: 'Health insurance premiums are eating my entire paycheck.',
    priority: 'Benefits & Wellbeing'
  }
};

const getTriggeredEvent = (round) => challenges.find(c => c.round === round) || null;

module.exports = { challenges, personas, getTriggeredEvent };
