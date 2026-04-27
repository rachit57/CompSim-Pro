// ============================================================
//  COMPSIM PRO — NARRATIVE ENGINE v3.0
//  Case Study: BharatQuick | "Deductive Leadership"
//  Graduate-level HR Simulation | MBA Compensation & Benefits
// ============================================================

// ─────────────────────────────────────────────────────────────
//  SECTION 1: SIMULATION ONBOARDING (Start Screen Content)
// ─────────────────────────────────────────────────────────────

export const SIMULATION_INTRO = {
  company_name: "BharatQuick",
  company_tagline: "India's fastest-growing quick-commerce platform",
  company_profile: {
    headline: "Company Overview",
    body: `BharatQuick is India's second-largest quick-commerce platform, operating in 38 cities with a workforce of 4,200+ employees spanning operations, technology, sales, and executive leadership. Founded in 2018, the company disrupted the grocery delivery market with its "12-minute delivery" promise and has since expanded into electronics, fashion, and pharmaceuticals.

The company is now 18 months from a pivotal IPO on the NSE, valued at ₹22,000 Crore. Investors have flagged a critical concern in their pre-IPO audit: BharatQuick's Total Rewards framework is a patchwork of legacy pay bands, ad-hoc retention bonuses, and inconsistent promotion cycles inherited from three acquisitions. The institutional investor Sequoia Capital's Mumbai office has formally requested a "People Risk" report before committing to the final funding round.

The Board has convened an emergency mandate: modernize the compensation architecture before the IPO lock-in window closes in 6 quarters.`,
  },
  your_role: {
    title: "Compensation Lead, Total Rewards",
    seniority: "VP-1 Level · Direct Report to CHRO Ananya Mehta",
    mandate: `You have been elevated from Senior Manager to acting VP-1 Compensation Lead — the youngest in the firm's history. Your mandate is clear: design and execute a Total Rewards strategy that balances three competing pressures:

(1) TALENT DENSITY — Retain the top 20% of performers who generate 80% of business value across all city tiers.

(2) INTERNAL EQUITY — Eliminate pay fault lines that are creating departmental friction, particularly between the Bangalore Tech hub and Tier-3 Operations cities.

(3) FISCAL DISCIPLINE — Stay within the Board-approved merit budget while demonstrating a credible ROI on each compensation rupee spent.`,
  },
  scoring_rubric: {
    headline: "How You're Evaluated: The Human Equity Score (HES)",
    description: "Your HES (0–100) is calculated every round from three equally weighted pillars:",
    pillars: [
      {
        name: "Talent Engagement Index",
        weight: "35%",
        description: "Measures how effectively your decisions reduce attrition risk across high-performers. Driven by merit allocation accuracy and promotion decisions.",
      },
      {
        name: "Pay Equity Parity (p-value)",
        weight: "35%",
        description: "Statistical measure of fairness. A p-value < 0.05 signals a 'Fault Line' — potential systemic pay bias that triggers regulatory and reputational risk.",
      },
      {
        name: "Budget Return on Investment",
        weight: "30%",
        description: "Performance value generated per rupee of merit budget deployed. Rewards precision targeting over blanket increases.",
      },
    ],
    warning: "Your HES is visible to the professor and is ranked against all teams. A score below 50 for two consecutive rounds triggers a 'Board Intervention' — a simulated performance review.",
  },
  simulation_format: {
    rounds: 6,
    decisions_per_round: [
      { lever: "Overall Merit Pool", description: "The % salary increase budget applied across all employees, weighted by performance tier." },
      { lever: "Sales Accelerator Multiplier", description: "Exponential commission boost for above-quota sales performers. Drives above-target behavior." },
      { lever: "Executive LTI Mix", description: "The % of executive compensation moved to Long-Term Incentives (ESOPs/RSUs) vs. immediate cash." },
      { lever: "Equity Adjustment Pool", description: "A discretionary budget (in ₹) to correct specific pay fault lines flagged in the parity audit." },
      { lever: "Promotion Decisions", description: "Nominate up to 2 employees per round for grade promotion (15% salary bump + career progression)." },
      { lever: "1-on-1 Interviews", description: "Interview up to 4 employees per round to unlock confidential sentiment and hidden retention risk signals." },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  SECTION 2: PER-ROUND STORIES & MANDATES (The Core Engine)
// ─────────────────────────────────────────────────────────────

export const ROUND_STORIES = {
  1: {
    title: "The Silent Exodus",
    act: "ACT I — DIAGNOSIS",
    situation: `It is your first week as acting Compensation Lead. CHRO Ananya Mehta drops a single slide deck on your desk marked CONFIDENTIAL: the results of an anonymous HR Pulse survey across 14 departments. The numbers are deceptively stable — headline turnover is at industry average. But the exit interviews tell a different story.

Three high-performers — a Senior QA Engineer in Mysore, a Regional Sales Lead in Jaipur, and a Senior Delivery Head in Hyderabad — resigned in the last 60 days. All three cited "better external opportunities." None cited dissatisfaction. That is the warning sign: when high-performers leave quietly, they were already gone for months before the resignation letter.`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Open the Workforce Hub and audit Comp-Ratios. Any employee with a Comp-Ratio below 0.85 is in the 'Green Circle' — at immediate flight risk.",
        "Conduct at least 3 confidential 1-on-1 interviews. Look for employees who haven't spoken yet — silence is rarely comfort.",
        "Set your Merit Pool. This is your first impression on the workforce. Too low and you signal neglect; too high and you exhaust your IPO budget in Round 1.",
        "Do not promote anyone yet. You don't have enough data. Premature promotions in Round 1 reduce budget headroom for crisis rounds ahead.",
      ],
    },
    watch_for: [
      "Employees in Tier-3 cities (Tier 3–4) with Comp-Ratios below 0.90",
      "Sales employees with a performance score of 4+ who have not received a recent increase",
      "N5 (Sneha, Mysore) — her comp-ratio is dangerously below market despite a performance score of 5",
    ],
    board_pressure: "The Board wants a 'Baseline Parity Score' established by end of Round 1. No action is itself a strategic decision — and a costly one.",
    scoring_lens: "Equity Parity (p-value) is weighted most heavily this round. Close the obvious pay gaps before anything else.",
    cfo_alert: null,
  },
  2: {
    title: "The Quota Plateau",
    act: "ACT II — PERFORMANCE",
    situation: `Quarter two numbers are in and the Sales Director, Vikram Rao, has walked into your office with a printed report. BharatQuick's sales team is hitting exactly 100% of quota — not 101%, not 115%. Perfectly, suspiciously, uniformly average. The Board is asking why growth has flatlined.

The answer is hiding in plain sight: your current commission structure is linear. Whether a rep closes 80% or 140% of target, the per-unit commission rate is the same. There is zero financial incentive to push past the finish line. High-performers like Siddharth in Bengaluru are already shopping their pipeline to DunzoScale, which just launched a 2.5x accelerator for above-quota closures.`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Set the Sales Accelerator Multiplier above 1.5x — this is the critical threshold for behavioral change. Below 1.5x, high-performers do not change behavior.",
        "Interview S1 (Siddharth, Bengaluru). His sentiment is the early signal for what the broader sales floor is feeling.",
        "Interview E1 (Arjun Kapoor, CEO). He is watching how you balance incentive spend with budget discipline.",
        "Review the Merit Pool — keep it at or below the Round 1 level unless you have specific justification. The budget is finite.",
      ],
    },
    watch_for: [
      "S1 (Siddharth) — top performer, actively evaluating external offers",
      "S4 (Chinmay, Jaipur) — performance is low but he claims market targets are miscalibrated for Tier-3 geography",
      "The gap between Sales employees' Comp-Ratios and Operations employees — if visible, it will resurface in Round 3",
    ],
    board_pressure: "Sequoia's analysts specifically asked: 'Is your variable pay structure capable of retaining top-quartile sales talent?' They want to see non-linear incentives in place.",
    scoring_lens: "Sales Accelerator decision is the primary driver this round. Talent Engagement Index weighted at 50%.",
    cfo_alert: "CFO Rajesh Sharma has flagged a ₹20L overspend risk if both Merit Pool and Sales Accelerator are set above recommended thresholds simultaneously.",
  },
  3: {
    title: "The Equity Whistleblower",
    act: "ACT III — INTERNAL EQUITY",
    situation: `Someone leaked the Tech department's Round 2 merit increases to the Operations floor in Jaipur. The message appeared on the company's internal Slack at 11:47 PM: a screenshot of salary ranges next to a single line — "Is this what equal pay looks like at BharatQuick?"

By morning, three Operations team leads in Tier-3 cities had submitted leave requests. The Jaipur Hub Manager, Neeraj Sharma, has escalated to CHRO Ananya Mehta. The company's Internal Communications team is already drafting a crisis memo. You have 24 hours to present a credible response — and it must be backed by real numbers, not just words.`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Run a parity audit via the Strategic Console. If your p-value is below 0.05, you have a statistically significant equity fault line that must be addressed immediately.",
        "Allocate the Equity Adjustment Pool specifically toward Operations and Tier-3 employees. Do not use it as a general merit topup.",
        "Interview N6 (Neeraj, Jaipur). He is the voice of the Operations cohort. His sentiment in this round determines whether the situation escalates to a formal complaint.",
        "Interview N3 (Priya, Hyderabad). She is a flight risk with a competing offer — and she now has a reason to accept it.",
        "Limit Merit Pool increase. The Board will view a blanket raise as a panic response, not a surgical fix.",
      ],
    },
    watch_for: [
      "N6 (Neeraj, Jaipur) — his 'Sector Jealousy' score is at a tipping point; one more round without correction triggers collective action",
      "N3 (Priya, Hyderabad) — 3 years at P3 grade, performance score 5, has an offer from Unilever",
      "Your p-value metric in the Strategic Console — if it crossed 0.05 last round, the Board already knows",
    ],
    board_pressure: "General Counsel Sunita Rao has formally requested a Pay Equity Compliance Report before the IPO filing window opens. Non-compliance delays the IPO by a minimum of one quarter.",
    scoring_lens: "Pay Equity Parity (p-value) is weighted at 60% this round. Engagement matters less than compliance.",
    cfo_alert: "An Equity Adjustment Pool below ₹3,00,000 this round will not be sufficient to close the observed fault lines. Minimum effective allocation is ₹5,00,000.",
  },
  4: {
    title: "The Dubai Calling",
    act: "ACT IV — RETENTION CRISIS",
    situation: `The call came at 8:15 AM on a Monday. Sneha Iyer, your highest-rated QA Engineer in Mysore (Performance: 5/5, Comp-Ratio: 0.79), has received a formal offer from a Dubai-based fintech startup: tax-free AED salary equivalent to ₹32 LPA, a relocation package, and ESOP in a pre-IPO company.

Her current BharatQuick CTC is ₹11.2 LPA. You are being asked to match an offer that is nearly three times her current pay. You cannot do that with a standard merit increase. This requires a combination of tools — an above-market retention adjustment, a meaningful LTI stake, and a personal commitment from leadership.

There is a second problem: Sneha is not alone. Intel from the talent market suggests two other Tier-3 employees have been approached by international firms this week.`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Raise the Executive LTI Mix above 35%. Sneha's profile is aligned with executive talent economics — she needs skin in the BharatQuick IPO story to stay.",
        "Set Merit Pool at 14%+. Anything below this signals to Sneha — and to the broader workforce — that BharatQuick cannot compete internationally.",
        "Interview N5 (Sneha, Mysore) immediately. She has given you a hearing window. Do not leave it unused.",
        "Consider promoting Sneha. A grade promotion signals career path, not just salary. It changes the conversation from 'rupees vs. rupees' to 'trajectory and ownership.'",
        "Allocate Equity Pool toward Tier-3 employees specifically — the international poaching threat is concentrated there.",
      ],
    },
    watch_for: [
      "N5 (Sneha, Mysore) — she is the named crisis employee. If her attrition risk stays above 80% after your decisions, she leaves and the case is logged as a retention failure.",
      "The domino effect — Sneha's departure will increase attrition probability for N6, N3, and S4 by 15–20%",
      "LTI Mix threshold: below 35% = ineffective. 35–50% = retention-probable. Above 50% = strong signal, but board will question cash flow impact.",
    ],
    board_pressure: "The Board Chair, Meera Krishnan, has personally flagged this incident. She wants to see a 'International Retention Protocol' in the Round 4 submission — a replicable playbook, not a one-off fix.",
    scoring_lens: "All three metrics weighted equally this round. This is the 'crisis management' test — Talent Engagement, Equity, and Budget discipline must all hold simultaneously.",
    cfo_alert: "CRISIS MODE: LTI costs are non-cash in the current quarter. The CFO has approved a one-time off-cycle adjustment for N5 (Sneha) without affecting the quarterly merit budget.",
  },
  5: {
    title: "The Agency Problem",
    act: "ACT V — EXECUTIVE ALIGNMENT",
    situation: `With two quarters left before the IPO, your attention shifts to the leadership cohort. A confidential report from the Strategy team reveals a troubling pattern: three of BharatQuick's five Division Heads are authorizing short-term operational decisions — vendor discounts, headcount freezes, partnership delays — that improve their quarterly EBITDA targets but erode the long-term brand and talent pipeline.

The cause is textbook Agency Theory: their Short-Term Incentive (STI) makes up 80% of variable pay. They are managing for the bonus cycle, not for the IPO valuation. Institutional investors have flagged this in their governance reports — a company where leadership is not aligned with long-term value is a red flag at IPO.`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Raise Executive LTI Mix to 45%+. Shift the incentive balance so that long-term value creation (measured by IPO milestones) outweighs short-term bonus maximization.",
        "Review the Workforce Hub for executives (E1, E2). Ensure their Comp-Ratios are at or above 1.0 before adjusting the LTI mix — an under-market executive with high LTI is not retained.",
        "Interview E1 (Arjun Kapoor, CEO) and E2 (Vikram Rao, Sales Director). Their sentiment will confirm whether the LTI redesign is landing or creating resentment.",
        "Keep Merit Pool conservative (8–10%). The board is watching budget discipline as an IPO readiness signal.",
        "Do not promote anyone without a clear succession plan rationale. Promotions must now be defensible to the IPO auditors.",
      ],
    },
    watch_for: [
      "E1 (Arjun, CEO) — his sentiment is the proxy for executive cohort health. If he is disengaged, the rest of the C-suite follows.",
      "E2 (Vikram, Sales Director) — he is the one most resistant to LTI shift, as his current STI windfall was significant",
      "Budget drain: if both Merit and LTI costs exceed 18% of the total salary base, the CFO triggers a mandatory review",
    ],
    board_pressure: "The IPO underwriter, Kotak Mahindra Capital, requires evidence that executive compensation is 'aligned with long-term shareholder value.' An LTI mix below 40% will be noted in the risk prospectus.",
    scoring_lens: "Budget ROI weighted at 50% this round. Precise, surgical decisions over broad generosity.",
    cfo_alert: "RSU vesting schedule has been updated. Any new LTI grants above 50% mix will require board sign-off. Budget for this contingency.",
  },
  6: {
    title: "The IPO Exit Interview",
    act: "ACT VI — CERTIFICATION",
    situation: `This is it. Kotak Mahindra's IPO auditors arrive Monday morning for a three-day 'People Due Diligence' review. Every compensation decision you have made across five rounds is now a line item in the due diligence report. The auditors are looking for three things: Is the pay structure internally equitable? Is it market-competitive? And is it sustainable at the growth trajectory BharatQuick has projected?

CHRO Ananya Mehta has already prepared your defense document. But the numbers speak louder than any memo. Five rounds of decisions — good and bad — are visible in the system. The HES you end with is the score that goes into the Compensation Governance section of the DRHP (Draft Red Herring Prospectus).`,
    mandate: {
      headline: "Your Mandate This Round",
      tasks: [
        "Stabilize — do not make dramatic changes. Erratic final-round decisions signal poor strategic discipline to auditors.",
        "Set Merit Pool at a defensible, market-aligned rate (8–12%). Too high signals unsustainable cost trajectory; too low signals talent risk.",
        "Ensure all p-values are above 0.05 (no fault lines active). A single unresolved equity flag in Round 6 will be cited in the risk section of the DRHP.",
        "Review your final HES score. A score above 75 results in a 'Clean Bill of People Health' from the auditors. Below 60 triggers an IPO delay recommendation.",
        "Your final submission is your legacy at BharatQuick — every number will be analyzed, justified, and published in the DRHP.",
      ],
    },
    watch_for: [
      "Any employee still in 'Green Circle' status — unresolved cases are cited as 'Identified but Unaddressed Risk'",
      "Executive LTI mix — must be above 35% to pass IPO governance screen",
      "p-value metric — must be > 0.05 across all departments in the final round",
    ],
    board_pressure: "Board Chair Meera Krishnan will present your final HES to Sequoia Capital and Kotak as a proof-of-concept for People Risk Management. This is not just a simulation score — it is the outcome of your strategic choices under real constraints.",
    scoring_lens: "All three pillars equally weighted. Consistency and defensibility matter as much as the final number. A dramatic last-round reversal will be penalized.",
    cfo_alert: "Final budget reconciliation: any Equity Pool allocation above ₹8,00,000 in Round 6 requires board approval. Plan accordingly.",
  },
};

// ─────────────────────────────────────────────────────────────
//  SECTION 3: CASE STUDY BRIEFING (Dossier Tab Content)
// ─────────────────────────────────────────────────────────────

export const CASE_STUDY_BRIEFING = {
  end_goal: `Architect a sustainable, high-growth compensation framework that maximizes 'Talent Density' and 'Internal Equity' while maintaining the fiscal discipline required for Q6 IPO Certification by Kotak Mahindra Capital and institutional investors. Your final Human Equity Score (HES) will be reviewed by the Board and presented in the IPO Draft Red Herring Prospectus (DRHP) under 'People Risk Management.'`,
  role_mandate: `As the acting Compensation Lead (VP-1, Total Rewards), you represent the bridge between Board-level fiscal constraints and ground-level talent engagement. You report directly to CHRO Ananya Mehta and have dotted-line accountability to CFO Rajesh Sharma for all budget decisions above ₹5L per round. Your success is measured by the Human Equity Score — a composite of Engagement, Pay Parity, and Budget ROI.`,
  strategic_roadmap: {
    1: "Baseline Audit · Conduct parity assessment, identify Green Circle employees, set initial merit rate",
    2: "Performance Overhaul · Introduce non-linear Sales Accelerator to break the quota plateau",
    3: "Equity Intervention · Deploy Equity Pool to resolve operational fault lines before regulatory escalation",
    4: "Retention Crisis · Combat international poaching with LTI-led retention protocol for Tier-3 talent",
    5: "Executive Alignment · Rebalance LTI/STI mix to align leadership with IPO value creation",
    6: "IPO Certification · Pass People Due Diligence with clean p-values and sustainable HES",
  },
  glossary: [
    {
      term: "Comp-Ratio",
      definition: "An employee's salary as a percentage of the market median for their role and geography. A ratio of 1.0 = exactly at market. Below 0.85 = 'Green Circle' (flight risk). Above 1.15 = potential overpay.",
    },
    {
      term: "Parity p-value",
      definition: "A statistical significance test on pay equity across gender, department, and geography. p < 0.05 indicates a 'Fault Line' — a statistically significant pay gap that constitutes a compliance risk.",
    },
    {
      term: "Sales Accelerator",
      definition: "An exponential commission multiplier that activates above 100% target achievement. A 2x accelerator means a rep closing 130% of quota earns double the standard per-unit rate on the incremental 30%.",
    },
    {
      term: "LTI / RSU",
      definition: "Long-Term Incentives (ESOPs, RSUs) that vest over 3–4 years. Used to align employee interests with company value creation. Critical for IPO-stage companies where equity appreciation is the primary retention tool.",
    },
    {
      term: "OTE (On-Target Earnings)",
      definition: "The total expected compensation (Base + Target Bonus/Commission) when an employee achieves exactly 100% of their performance target.",
    },
    {
      term: "Agency Problem",
      definition: "A principal-agent conflict where executives optimize for personal short-term bonuses instead of long-term company value. Solved by shifting compensation from STI to LTI.",
    },
    {
      term: "Green Circle",
      definition: "Internal BharatQuick designation for employees whose Comp-Ratio is below 0.85 — meaning they are being paid meaningfully below market. These employees are the highest attrition risk in any given round.",
    },
    {
      term: "DRHP",
      definition: "Draft Red Herring Prospectus — the IPO document submitted to SEBI. The 'People Risk' section requires a certified compensation governance statement, which your HES feeds into.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  SECTION 4: NARRATIVE DOSSIER (Memos & Intel)
// ─────────────────────────────────────────────────────────────

export const NARRATIVE_DOSSIER = {
  ceo_memo: {
    title: "Project Phoenix: Executive Mandate on Total Rewards",
    author: "Arjun Kapoor, Group CEO · BharatQuick",
    content: `Team,

I want to be direct with you. We are 18 months from the IPO window and our People Risk score is the weakest item in the Sequoia due diligence report. That is not acceptable.

BharatQuick is expanding at an 18-month compressed growth cycle, yet our compensation architecture is a legacy fixed-cost model from our Series B days. It was designed for 600 employees. We have 4,200. It was designed for one city. We operate in 38.

The result? We are not losing undistinguished performers. We are losing the top 15% — quietly, to firms who have built the model we should have built two years ago.

I expect the acting Compensation Lead to bring the same analytical discipline to this that our Engineering team brings to our routing algorithm. I do not want cost-of-living adjustments dressed up as strategy. I want a framework that makes our best people genuinely untouchable by competitors, while creating a sustainable, auditable pay structure that institutional investors can put their names behind.

The IPO clock is ticking. Project Phoenix starts now.

— AK`,
  },
  board_intercept: {
    title: "CONFIDENTIAL: Pre-IPO People Risk Assessment",
    author: "Meera Krishnan, Board Chair · For Internal Circulation Only",
    content: `This document summarizes the Board's key observations from Q3 talent data. It is not for distribution beyond the CHRO and the Compensation function.

FINDING 1 — SECTOR JEALOUSY: The Operations team in Tier-2 and Tier-3 cities is acutely aware of the Bangalore Tech team's compensation premium. In the last Pulse Survey, 62% of Ops employees rated 'Internal Pay Fairness' as the top driver of dissatisfaction. We flag this as a medium-term strike risk if not addressed categorically.

FINDING 2 — SALES PLATEAU: The current linear commission structure has created a 'comfort ceiling.' Top sales performers are hitting quota and disengaging for the remainder of the quarter. This is a structural design flaw, not a motivation problem. The fix is architectural, not motivational.

FINDING 3 — EXECUTIVE MISALIGNMENT: STI payouts for three Division Heads in Q3 were at maximum, while their divisions underperformed on 6-month KPIs. This is the textbook Agency Problem. The Board requires LTI rebalancing before the IPO underwriter's governance review.

RECOMMENDATION: The Compensation Lead must treat internal equity, not just market competitiveness, as the primary risk vector in the next four quarters.

— MK, Board Chair`,
  },
  market_gossip: {
    title: "Intelligence Hub: Market Heatmap & Talent Signals",
    content: `REAL-TIME MARKET INTELLIGENCE — Updated End of Week:

▪ BANGALORE TECH (Tier 1): Senior engineering talent is now treating LTI (ESOPs/RSUs) as a primary decision factor — not a 'nice to have.' Firms unable to offer a minimum 20% LTI component in total CTC are being screened out at the offer stage. Benchmarks from Swiggy, Zepto, and ONDC show average senior tech CTC at ₹28–42L.

▪ SALES SECTOR: DunzoScale launched a 2.5x Sales Accelerator last month. Three BharatQuick account managers have already had conversations with their recruiter. Fixed OTE with linear commission is now below market for B2B sales roles in any Tier-1 city.

▪ EXPAT PIPELINE (The Dubai Exit): An observable spike in Tier-2 and Tier-3 managers receiving international offers, primarily from UAE-based fintech and e-commerce startups. The tax-free draw of AED salaries against INR fixed pay is significant — the effective purchasing power gap is 2.2x for Tier-3 city employees. This is not a one-off. Build a protocol.

▪ JAIPUR / INDORE (Tier 3): Despite market complexity, productivity data shows Tier-3 employees are outperforming their Tier-1 counterparts on a per-rupee basis by 34%. There is a strong geo-arbitrage case for selective investment here — if you can retain them.`,
  },
};

// ─────────────────────────────────────────────────────────────
//  SECTION 5: EMPLOYEE PULSE REGISTRY (Confidential 1-on-1s)
// ─────────────────────────────────────────────────────────────

export const EMPLOYEE_PULSE: Record<number, Record<string, string>> = {
  1: {
    S1: `I'm hitting 100% every quarter. Consistently. But the commission structure doesn't differentiate between someone hitting 100% and someone hitting 140%. So I hit 100% and go home. That's not laziness — that's math. Fix the math.`,
    N1: `I've been tracking what Swiggy pays their backend engineers in Bengaluru. The gap against my current CTC is around 35%. I'm not complaining yet. But I'm also not not looking.`,
    N5: `People in Bengaluru complain about the traffic while taking three times my salary. I do the same QA work from Mysore. Yes, my rent is lower. But it's not one-third lower. Is there a number that says what my work is actually worth to this company?`,
    E1: `I need to see the P2P pay equity numbers. If we have a fault line between Tech and Ops, and it comes out in the IPO filing before we've addressed it, we have a governance failure. Not a PR problem — a governance failure.`,
  },
  2: {
    S1: `A friend at a competitor just received an accelerator cheque that is more than my annual bonus. He closed 145% of target. I closed 138%. Difference? He gets 2.5x on the incremental. I get the same flat rate. One of us is going to make a career decision soon.`,
    E1: `The Board is watching variable pay design very carefully ahead of the IPO. I personally need to see more 'skin in the game' in my own package — a larger LTI stake that aligns me with the 3-year plan. Fixed salary isn't what motivates me at this stage.`,
    S4: `The Jaipur market is different. The targets were calibrated on Bengaluru conversion rates. I'm selling to SMEs with different payment cycles and smaller ticket sizes. I'm not underperforming — the benchmark is wrong for my geography.`,
    N3: `I've been at P3 grade for three years. My performance score is a 5. I have an offer from a multinational. The offer is for a P4 equivalent role. I'm not leaving because of money — I'm leaving because I can't see the next step here.`,
  },
  3: {
    N6: `The Slack screenshot was me. Yes, I sent it. And I stand by it. The Operations team in Jaipur delivers the product that makes BharatQuick work. The Bengaluru Tech team builds the app. We're both essential. But you'd never know that from the pay bands. Fix it, or this gets louder.`,
    N3: `Unilever confirmed the offer in writing this morning. P4, ₹31L CTC, Mumbai. I have until Friday. I'm only sitting here because I was told the Compensation team is reviewing cases like mine. Are you? Because I need a reason to say no, and 'BharatQuick has a great culture' is not that reason.`,
    S1: `The accelerator has helped. I'll give you that. But the Ops team finding out about the Tech salaries has created a weird tension. The delivery runners are now asking their managers about compensation. Those managers are asking me. I don't have answers.`,
    E2: `My quarterly bonus hit a new high last quarter. But I'll be honest — I spent three months optimizing for that number. Some of the Q4 decisions I made were better for my bonus than for the company's 18-month plan. I know that. The incentive structure is pulling me in the wrong direction.`,
  },
  4: {
    N5: `I have the offer letter in front of me. Dubai. Tax-free. Relocation covered. They want an answer by Thursday. BharatQuick has been my entire career. But I have to think about my family. I need to see something real on paper — not a conversation, not a promise. Numbers.`,
    N6: `After Round 3, the Jaipur team feels slightly better. But 'slightly' doesn't mean 'secure.' Two of our team leads are also looking at UAE options. Sneha leaving will send the wrong signal at the worst possible time. The Tier-3 cohort is watching how this gets handled.`,
    S4: `If Sneha leaves, I'm going to take it as confirmation that BharatQuick sees Tier-3 as expendable. I already feel like the Jaipur market targets are unfair. Her departure would be the last signal I need to start a serious job search.`,
  },
  5: {
    E1: `The LTI rebalancing makes sense to me strategically. If my variable pay is tied to the IPO valuation, I'm thinking about 3-year decisions, not 3-month decisions. But be careful: the other executives won't like seeing their quarterly STI reduced. You need to handle the communication carefully.`,
    E2: `I've seen the proposal. I understand the Agency Theory argument. But I'm going to push back: if you shift my comp to 50% LTI and the IPO underperforms, I've taken all the risk. There needs to be a floor. What's the vesting protection if we miss the IPO window?`,
    N3: `I stayed. Barely. But I stayed. The promotion to P4 made the difference. Now I need to see the progression path to P5. I'm not asking for anything I haven't earned — I'm asking for a system that acknowledges it.`,
  },
  6: {
    E1: `The due diligence team asked me directly: 'Is your compensation structure designed for the next three years, or is it a reaction to the last three crises?' I told them it was designed. I need you to make sure that's true.`,
    N5: `I stayed. The LTI offer was the deciding factor — more than the merit increase. If BharatQuick's IPO delivers, this will have been the best decision of my career. I'm all in.`,
    S1: `The accelerator worked. Q3 was my best quarter ever — 168% of target. I'm not looking at other offers anymore. The math finally makes sense.`,
    N6: `The Jaipur team is stable. Not euphoric — stable. That's actually the right place to be. High performers are measured. We're watching the IPO outcome as much as anyone.`,
  },
};
