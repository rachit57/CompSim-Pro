export const NARRATIVE_DOSSIER = {
  ceo_memo: {
    title: "Project BharatQuick: The 2026 Mandate",
    author: "Ishaan Kapur, Group CEO",
    content: `Team, we are no longer just an app; we are the backbone of Indian consumption. From delivering groceries in 10 minutes in Mumbai to launching supply chains in Jaipur, BharatQuick is at a crossroads. 

Our 'Quick-Commerce' wing is bleeding talent to VC-funded rivals, while our 'Legacy FMCG' division is struggling with massive geographic pay disparities. As our Head of Total Rewards, your job is to stabilize this 15-person core leadership and staff. If we don't fix our Internal Equity now, we won't survive the IPO next year. 

Strategic Focus:
1. Talent Retention in Bangalore (Tech & Product).
2. Cost Optimization in Tier 3/4 Cities (Operations).
3. Aligning Sales Incentives for our massive expansion targets.`
  },
  cfo_memo: {
    title: "Financial Guardrails: ROI & The Burn",
    author: "Meera Nair, CFO",
    content: `Let's be clear: FMCG margins are thin (12-15%). We cannot blindly follow Tech-industry salary inflation. Every rupee spent on 'Base Pay' is a recurring expense. 

I am authorizing a Merit Pool, but I want to see **Sales Accelerators** used for the field teams. We only pay top-dollar for top-performance. Watch your **Comp-Ratio**—if we are paying 120% of market for a Tier-3 logistics role, you are failing our P&L.`
  },
  board_mandate: {
    title: "Directive 402: Equity & Parity",
    author: "Board of Directors",
    content: `The Board will not tolerate a 'Boys Club' culture. Our Pay Parity (p-value) must stay above 0.05. We require a statistical justification for any gap exceeding 5%. 

Furthermore, we are applying **Agency Theory** to our Executive tier. Their pay must be heavily weighted toward LTIs (RSUs) to ensure they aren't just chasing short-term quarterly bonuses.`
  },
  theory_intel: {
    title: "The C&B Leadership Bible",
    content: `Mastering this role requires understanding the psychology of pay:

- **Equity Theory**: Employees don't just care what they make; they care what their peer 'Amit' makes. If Amit is a lower performer but makes more, Equity Perception crashes.
- **Expectancy Theory**: The link between effort and reward. If a Sales person hits 120% quota but gets the same bonus as someone at 80%, they will quit. This is why we use **Accelerators**.
- **The 50% Rule**: Per Indian Labour Code, Basic Pay must be 50% of CTC. Violating this triggers legal audits.`
  }
};

export const ROUND_STORIES = {
  1: {
    title: "The Legacy Audit",
    story: "Welcome to BharatQuick. You've inherited a messy salary structure. Your first task is to audit the 'Workforce Hub' and identify who is 'Red-Circled' (paid too high) and who is 'Green-Circled' (paid too low). The market is moving fast."
  },
  2: {
    title: "The Bangalore Poaching Strike",
    story: "URGENT: A rival Quick-Commerce giant is offering your Key Account Managers a 40% hike. If your 'Expectancy' links are weak, your sales stars will walk out today. Check the Benchmarking tab."
  },
  3: {
    title: "The Strategic Board Audit",
    story: "BOARD REQ: 'Prove the math.' The Board is questioning our Sales Commission budget. We need you to identify the standard Sales Accelerator formula before they freeze the budget."
  },
  4: {
    title: "The Tier-2 Expansion Gap",
    story: "We are moving logistics to Pune and Jaipur. The 'Geographic Differential' is tricky. Do we keep Bangalore rates or move to local scales? Be careful with Equity Theory here—regional resentment is growing."
  },
  5: {
    title: "The Equity Whistleblower",
    story: "A report highlights a 15% pay gap in the Product department. The p-value is dropping. If you don't adjust the 'Equity Pool' now, the PR damage will be irreversible."
  },
  6: {
    title: "The IPO Reckoning",
    story: "Final Round. The CEO needs a final HES score to present to the IPO investors. Stabilize the workforce, maximize ROI, and ensure the Grade-mix is sustainable."
  }
};

export const FORMULA_OPTIONS = [
  { text: 'Commission = (Quota % * Rate) + (Over-achievement * Accelerator)', correct: true, id: 'sales_acc' },
  { text: 'Comp-Ratio = Total Comp / Years of Service', correct: false, id: 'wrong_1' },
  { text: 'Merit Pool = Revenue / Headcount', correct: false, id: 'wrong_2' }
];
