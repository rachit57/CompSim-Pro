const challenges = [
  {
    id: 'intro_audit',
    title: 'The Workforce Audit',
    round: 1,
    description: 'The CFO wants a report on "Green-Circled" employees (those below pay ranges).',
    options: [
      { id: 'A', text: 'Market Correction (Budget -5%)', impact: { budget: 0.95, engagement: 0.1, pValue: 0.05 } },
      { id: 'B', text: 'Wait for Merit Cycle', impact: { budget: 1.0, engagement: -0.05, pValue: -0.02 } }
    ]
  },
  {
    id: 'poach_tech',
    title: 'The Bangalore Talent War',
    round: 2,
    description: 'A rival is offering your tech leads a 40% hike. Equity Theory suggests your remaining team will demand parity.',
    options: [
      { id: 'A', text: 'Targeted Retention (Budget -8%)', impact: { budget: -0.08, turnover: -0.05, engagement: 0.1 } },
      { id: 'B', text: 'Accelerate LTI Vesting', impact: { budget: 0, turnover: -0.02, engagement: 0.15 } },
      { id: 'C', text: 'Let them Exit', impact: { budget: 0.1, turnover: 0.15, engagement: -0.1 } }
    ]
  },
  {
    id: 'sales_audit',
    title: 'The Sales Incentive Crisis',
    round: 3,
    description: 'The Board is concerned about "Target Coasting." Top performers are hitting quota and stopping. We need to overhaul our Variable Pay structure.',
    options: [
      { id: 'A', text: 'Implement High Accelerators', impact: { roi: 0.15, budget: -0.05, engagement: 0.1 } },
      { id: 'B', text: 'Tighten Quotas (Fixed Comm)', impact: { roi: 0.05, budget: 0.05, engagement: -0.15 } }
    ]
  },
  {
    id: 'equity_gap',
    title: 'The Regional Parity Gap',
    round: 4,
    description: 'Logistics leads in Jaipur (Tier 3) are seeing Bangalore (Tier 1) salaries on Glassdoor. Regional resentment is spiking.',
    options: [
      { id: 'A', text: 'Establish Geo-Pay Differentials', impact: { budget: -0.05, engagement: -0.05, pValue: 0.1 } },
      { id: 'B', text: 'One-India Pay Policy (High Cost)', impact: { budget: -0.15, engagement: 0.2, pValue: 0.2 } }
    ]
  },
  {
    id: 'dei_audit',
    title: 'Whistleblower Case',
    round: 5,
    description: 'A p-value audit reveals a statistically significant gender pay gap in the Product team.',
    options: [
      { id: 'A', text: 'Instant Correction (Budget -10%)', impact: { pValue: 0.15, budget: -0.1, engagement: 0.15 } },
      { id: 'B', text: 'Legal Contingency Plan', impact: { pValue: -0.1, budget: -0.05, engagement: -0.1 } }
    ]
  },
  {
    id: 'ipo_prep',
    title: 'The Final Grade Audit',
    round: 6,
    description: 'IPO investors are auditing our Grade-mix. Too many VPs (Grade M1+) is raising overhead flags.',
    options: [
      { id: 'A', text: 'Strict Grade Hierarchy', impact: { budget: 0.1, engagement: -0.1, roi: 0.15 } },
      { id: 'B', text: 'Strategic Promotion Pool', impact: { budget: -0.05, engagement: 0.15, roi: 0.1 } }
    ]
  }
];

const getTriggeredEvent = (round) => challenges.find(c => c.round === round) || null;

module.exports = { challenges, getTriggeredEvent };
