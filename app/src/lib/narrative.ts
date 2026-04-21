export const ROUND_STORIES = {
  1: {
    title: "Baseline Calibration",
    brief: "The Board has authorized a Strategic Review. Balance the budget while stabilizing initial churn.",
    story: "Welcome, CRO. The economy is in a 'Goldilocks' phase, but rumors of a competitor poaching spree are surfacing. This is your Calibration Phase.",
    goal: "Maintain HES above 70 and budget utilization below 98%."
  },
  2: {
    title: "The Silicon Poaching Strike",
    brief: "A global competitor is offering your 'Tech Stars' a 40% jump in pay.",
    story: "URGENT: 'TechTalent Inc' has opened a hub across the street. Glassdoor chatter is explosive. You need a retention strike immediately.",
    goal: "Drop Tech attrition risk below 5%."
  },
  3: {
    title: "The Strategic Board Audit",
    brief: "The Board demands technical proof of your market positioning index.",
    story: "BOARD REQ: 'Prove to us that our Pay ranges are aligned with the market. What index are you using to track this?'",
    goal: "Choose the correct Compensation Formula to proceed."
  },
  4: {
    title: "External Pay Equity Wave",
    brief: "Whistleblower reports have triggered a regulatory audit of your pay gap.",
    story: "NEWS ALERT: 'Equal Pay Act Compliance' is trending. The Audit team is in the lobby. P-Value must stay above 0.05.",
    goal: "Improve P-Value parity through equity adjustments."
  },
  5: {
    title: "The Blue-Collar Drive",
    brief: "The manufacturing segment is picketing for better healthcare benefits.",
    story: "MESSAGE FROM FIELD: Warehouse teams are organizing. Junior analysts are sympathetic. A strike is imminent.",
    goal: "Stabilize workforce engagement and prevent a strike."
  },
  6: {
    title: "The CEO Reckoning",
    brief: "Margins are thinning. The CEO demands a final Efficiency Strategy.",
    story: "FINAL YEAR MEMO: 'We have survived the year. Now, we must optimize. Is our human equity score competitive?'",
    goal: "Maximize your final HES and ROI metrics."
  }
};

export const FORMULA_OPTIONS = [
  { text: 'Comp-Ratio = (Salary / Market Midpoint)', correct: true },
  { text: 'Pay Spread = (Max - Min) / Salary', correct: false },
  { text: 'Revenue Efficiency = FTE / GMV', correct: false }
];
