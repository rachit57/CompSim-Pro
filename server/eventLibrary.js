const challenges = [
  {
    id: 1,
    title: 'Competitor Poaching Strike',
    type: 'Talent Crisis',
    description: 'A rival just offered your top 20% earners a 30% raise.',
    options: [
      { id: 'A', text: 'Match offers (Budget Hit)', impact: { budget: -0.05, engagement: 0.02, turnover: -0.02 } },
      { id: 'B', text: 'Accelerate LTI vesting (Equity Dilution)', impact: { budget: 0, engagement: 0.05, turnover: -0.01 } },
      { id: 'C', text: 'Accept attrition', impact: { budget: 0.05, engagement: -0.05, turnover: +0.05 } }
    ]
  },
  {
    id: 2,
    title: 'VC Board Freeze',
    type: 'Budget Shock',
    description: 'Board imposes a 10% comp budget freeze immediately.',
    options: [
      { id: 'A', text: 'Cut Variable Pay', impact: { budget: 0.1, engagement: -0.08 } },
      { id: 'B', text: 'Delay Merit Increases', impact: { budget: 0.1, engagement: -0.1, turnover: 0.02 } },
      { id: 'C', text: 'Reduce Benefits Tier', impact: { budget: 0.1, engagement: -0.15, turnover: 0.03 } }
    ]
  }
  // Add other challenges...
];

function getRandomChallenges(count) {
  const shuffled = challenges.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateTalentPersona() {
  const names = ['Aisha Chen', 'Marcus Johnson', 'Sarah Lee', 'David Kim'];
  const roles = ['Senior ML Engineer', 'Principal Designer', 'VP of Sales', 'Lead HRBP'];
  
  return {
    name: names[Math.floor(Math.random() * names.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    flightRisk: Math.random() > 0.5 ? 'HIGH' : 'LOW',
    currentComp: 120000 + (Math.random() * 50000),
    marketOffer: 150000 + (Math.random() * 60000),
    driver: Math.random() > 0.5 ? 'Salary' : 'Remote flexibility'
  };
}

module.exports = { getRandomChallenges, generateTalentPersona };
