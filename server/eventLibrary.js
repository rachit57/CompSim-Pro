const challenges = [
  {
    id: 'poach_tech',
    title: 'The Silicon Poaching Strike',
    round: 2,
    description: 'A global competitor has opened a local hub and is offerring your "Tech Stars" a 40% jump in base pay.',
    options: [
      { id: 'A', text: 'Match Market (Budget -15%)', impact: { budget: -0.15, turnover: -0.05, engagement: 0.05 } },
      { id: 'B', text: 'Accelerate LTI Vesting', impact: { budget: 0, turnover: -0.02, engagement: 0.08 } },
      { id: 'C', text: 'Accept Managed Attrition', impact: { budget: 0.1, turnover: 0.12, engagement: -0.1 } }
    ]
  },
  {
    id: 'equity_audit',
    title: 'External Pay Equity Audit',
    round: 3,
    description: 'A whistleblower report has triggered a regulatory audit of your gender pay gap.',
    options: [
      { id: 'A', text: 'Internal Corrections (Budget -8%)', impact: { pValue: 0.1, budget: -0.08 } },
      { id: 'B', text: 'Legal Defense', impact: { pValue: -0.05, budget: -0.1, engagement: -0.05 } },
      { id: 'C', text: 'Ignore (High Risk)', impact: { pValue: -0.2, budget: 0 } }
    ]
  },
  {
    id: 'union_drive',
    title: 'Blue-Collar Union Drive',
    round: 4,
    description: 'The manufacturing segment is organizing for better healthcare benefits.',
    options: [
      { id: 'A', text: 'Upgrade Health Tier', impact: { budget: -0.1, engagement: 0.12, pValue: 0.02 } },
      { id: 'B', text: 'Fixed % Hike', impact: { budget: -0.08, engagement: 0.05 } },
      { id: 'C', text: 'Efficiency Layoffs', impact: { budget: 0.2, engagement: -0.2, turnover: 0.15 } }
    ]
  }
];

const personas = {
  tech: {
    title: 'Tech Stars',
    count: 200,
    avgPay: 150000,
    chatter: 'I heard Google is offering unlimited free sushi and a 15% bonus...',
    priority: 'Base Pay & Growth'
  },
  leader: {
    title: 'Executive Leadership',
    count: 40,
    avgPay: 450000,
    chatter: 'The variable component is too low; my LTI is underwater.',
    priority: 'Variable Pay (Bonus/LTI)'
  },
  junior: {
    title: 'Junior Analysts',
    count: 800,
    avgPay: 65000,
    chatter: 'I just want to be able to work from the beach once a month.',
    priority: 'Wellbeing & Benefits'
  }
};

function getTriggeredEvent(round) {
  return challenges.find(c => c.round === round) || null;
}

module.exports = { challenges, personas, getTriggeredEvent };
