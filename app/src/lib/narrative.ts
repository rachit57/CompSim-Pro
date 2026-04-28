// ============================================================
//  COMPSIM PRO - NARRATIVE ENGINE v4.0
//  Case Study: BharatQuick | "Deductive Leadership"
// ============================================================

// ─────────────────────────────────────────────────────────────
//  TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface OnboardingSlide {
  category: string;
  headline: string;
  subheadline?: string;
  type: 'text' | 'memo' | 'guide';
  paragraphs: string[];
  memo?: { from: string };
  levers?: { name: string; description: string }[];
  glossary?: { term: string; definition: string }[];
}

export interface RoundStory {
  title: string;
  act: string;
  paragraphs: string[];
  available_actions: { name: string; description: string }[];
}

// ─────────────────────────────────────────────────────────────
//  ONBOARDING CONTENT - 4 slides shown before Round 1
// ─────────────────────────────────────────────────────────────

export const ONBOARDING_CONTENT: OnboardingSlide[] = [
  {
    category: 'Company Overview  ·  Part 1 of 2',
    headline: 'BharatQuick',
    subheadline: "India's fastest-growing quick-commerce platform",
    type: 'text',
    paragraphs: [
      "BharatQuick was founded in 2018 by Arjun Kapoor and Vikram Rao in a rented warehouse in Bengaluru's Koramangala district, with one delivery bike and an audacious promise: grocery delivery in under twelve minutes. The idea was dismissed by logistics veterans, funded by a Series A that most institutional investors passed on, and proven correct within eighteen months. Four years later, BharatQuick operates across 38 cities, employs over 4,200 people, and holds the number two position in India's ₹12,000-crore quick-commerce market.",
      "The company's growth has never been linear. A 2021 acquisition of MumbaiCart expanded its Tier-1 footprint but inherited a legacy salary structure that was never fully renegotiated. A 2022 acquisition of Jaipur-based DelivFast added 600 operations staff under employment terms that predated BharatQuick's own compensation philosophy. The result: a workforce of 4,200 people operating under at minimum three distinct pay architectures - a consequence of velocity, not negligence. Nobody had time to unify them.",
      "Despite this complexity, the product remains exceptional. BharatQuick's Net Promoter Score holds at 74 - the highest in the category. Its proprietary routing algorithm handles 18,000 hyperlocal delivery events per hour. The last annual report carried a line from the CEO that now reads like a mandate: 'We have built the infrastructure of a category leader. Our next chapter is about building the organisation of one.'",
      "The company is 18 months from listing on the National Stock Exchange, currently valued at ₹22,000 crore on a pre-money basis. The road to that listing runs directly through People Risk - and that is where you come in.",
    ],
  },
  {
    category: 'Company Overview  ·  Part 2 of 2',
    headline: 'The Inflection Point',
    type: 'text',
    paragraphs: [
      "The headline attrition number - 14.2% - sits within industry norms. The board-level dashboard shows nothing unusual. But when the CHRO's office cross-referenced exit cohorts against performance ratings, a pattern emerged that the headline concealed. Employees rated 4 or 5 out of 5 were leaving at roughly twice the rate of the general workforce, and doing so quietly - with polished resignation letters that mentioned opportunity, not frustration. High performers were already gone before the letter was written.",
      "Institutional investor Sequoia Capital, reviewing a potential final commitment ahead of the IPO, commissioned a third-party People Risk assessment. The report flagged three concerns to the Board. First: the compensation architecture shows statistical anomalies in pay equity across departments and city tiers - potential compliance exposure under SEBI listing obligations. Second: the variable pay design for the sales function does not incentivise above-quota performance, with measurable consequences for revenue growth projections. Third: executive compensation is weighted heavily toward short-term cash incentives, which Sequoia considers misaligned with a company positioning itself for long-term public-market performance.",
      "The Board convened an emergency session. The outcome was unambiguous: the compensation architecture must be redesigned and independently certified before the IPO filing window opens in six quarters. The Board Chair, Meera Krishnan, framed it directly: 'This is not an HR project. This is an IPO requirement.'",
      "Everything that comes next is your responsibility. The decisions you make across six rounds will appear - under your name - in the People Risk section of BharatQuick's Draft Red Herring Prospectus, filed with SEBI ahead of the NSE listing.",
    ],
  },
  {
    category: 'Your Role',
    headline: 'Compensation Lead, Total Rewards',
    subheadline: 'VP-1  ·  Reporting to CHRO Ananya Mehta',
    type: 'memo',
    paragraphs: [
      "I want to be direct about why I chose you for this assignment and what I need from you. You have a clearer view of our compensation architecture than anyone else in this organisation. You also have no political stake in defending the decisions that created its current state. That combination is rare, and right now it is exactly what this situation requires.",
      "Your mandate is not to reduce costs. It is not to keep employees happy. It is to design a compensation framework that is simultaneously fair, market-competitive, and financially sustainable - under conditions that are anything but straightforward. You will face a workforce divided by geography, function, and acquisition history. You will face a Board watching every rupee through an IPO lens. You will face individual employees whose careers and livelihoods depend directly on the decisions you make.",
      "Six decision points. Six quarters. The Board has approved a merit budget, an equity adjustment pool, and the flexibility to restructure variable pay. Everything beyond that is your judgment. I will not tell you what the right answer is - in many cases, there is more than one. What I will tell you is that the cost of inaction is as visible in the data as the cost of a bad decision.",
      "Your Human Equity Score will be reviewed by the Board after every round. The IPO auditors will see the final number. Make it defensible.",
    ],
    memo: { from: 'Ananya Mehta, Chief Human Resources Officer · BharatQuick' },
  },
  {
    category: 'Simulation Guide',
    headline: 'How This Works',
    type: 'guide',
    paragraphs: [
      "This simulation runs across six rounds, each representing one strategic quarter at BharatQuick. Before each round, you receive a situation briefing - a narrative account of what is happening inside the company. You then enter the Command Centre, where you can access workforce data, market benchmarks, conduct confidential interviews, and submit your decisions.",
      "Your performance is tracked through the Executive Human Equity Score (X-HES) - a composite metric reflecting the cumulative health of your compensation decisions. Your X-HES is updated after each round and is visible to your professor throughout the simulation.",
      "CRITICAL: You are managing Political Capital. This represents your standing with the Board. High-risk decisions—such as exceeding budget or issuing off-cycle retention bonuses (Shadow Debt)—will consume this finite resource. If Political Capital reaches zero, you will be terminated from your position, and the simulation will end.",
      "NOTE: Workforce data is subject to Manager Bias. The performance scores displayed on your dashboard may deviate from an employee's actual productivity. You can utilize Political Capital to conduct an 'HR Audit' to verify the ground truth for any individual. Your mandate is to maintain organizational health, which may include the surgical removal of employees who negatively impact the collective utility."
    ],
    levers: [
      { name: 'Merit Pool', description: 'Sets the percentage salary increase applied across the workforce, weighted by individual performance ratings.' },
      { name: 'Sales Accelerator Multiplier', description: 'Determines the commission rate multiplier that activates when a sales employee exceeds 100% of their quarterly target. A 1x multiplier applies the standard rate; higher multipliers increase the rate on incremental revenue above target.' },
      { name: 'Executive LTI Mix', description: 'Sets the percentage of executive variable pay allocated as Long-Term Incentives (ESOPs or RSUs) rather than immediate cash bonuses. The remainder is paid as short-term cash.' },
      { name: 'Equity Adjustment Pool', description: 'A discretionary rupee budget directed at specific pay anomalies - typically employees whose current salary is significantly below the market median for their role and location.' },
      { name: 'Promotion Decisions', description: 'Nominate up to 2 employees per round for a grade-level promotion. A promotion applies a 15% CTC increase and changes the employee\'s grade in the workforce records.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations per round with individual employees. These surface qualitative information not visible in the salary and performance data.' },
    ],
    glossary: [
      { term: 'Comp-Ratio', definition: "An employee's salary divided by the market median for their role and city tier. A ratio of 1.0 means paid exactly at market. Below 0.85 is flagged as a retention risk." },
      { term: 'p-value (Pay Parity)', definition: 'A statistical measure of pay equity across groups. A p-value below 0.05 signals a statistically significant pay disparity - a compliance risk under SEBI listing obligations.' },
      { term: 'LTI / RSU', definition: 'Long-Term Incentive / Restricted Stock Unit. Equity grants that vest over 3–4 years, aligning the recipient\'s financial outcome with long-term company value.' },
      { term: 'OTE', definition: 'On-Target Earnings. Total expected compensation (base salary + target variable pay) when an employee achieves exactly 100% of their performance objectives.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  ROUND STORIES - Situation briefings per quarter
// ─────────────────────────────────────────────────────────────

export const ROUND_STORIES: Record<number, RoundStory> = {
  1: {
    title: 'The Silent Exodus',
    act: 'Round 1 of 6',
    paragraphs: [
      "The exit reports come in batches of three. You notice this because you're tallying the last sixty days on a Monday morning - six names, two batches, all processed through final HR clearance without a single escalation flag. The headline numbers look fine. Attrition at 14.2% sits within the sector average. The board-level dashboard shows nothing unusual.",
      "But three of the six employees who left were rated 4 or 5 out of 5. Two were flagged as critical talent in last year's succession planning exercise. One was being groomed for a regional leadership role. None of their resignation letters mentioned salary. None mentioned a competing offer. The language is precise and diplomatic - the language of people who have already decided months before they wrote it.",
      "You pull the workforce file. The data is there: salaries, performance ratings, city classifications, market benchmarks. Some of what you find is uncomfortable. The patterns are not hidden, but they are also not explained in any documentation you inherited. Nobody has conducted a structured analysis of where BharatQuick's pay sits relative to the external market - across 38 cities, across three legacy compensation frameworks, across every department and grade level.",
      "CHRO Ananya Mehta's message this morning was four words: 'Find the fault lines.' She did not elaborate on what you're expected to find, or what you should do about it. That part is yours.",
    ],
    available_actions: [
      { name: 'Merit Pool', description: 'Allocate a percentage salary increase across all employees, weighted by performance rating.' },
      { name: 'Equity Adjustment Pool', description: 'Direct a discretionary budget toward specific pay anomalies identified in the workforce data.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations with individual employees from the roster.' },
      { name: 'Promotion Decisions', description: 'Nominate up to 2 employees for a grade-level promotion with a 15% CTC increase.' },
    ],
  },
  2: {
    title: 'The Quota Plateau',
    act: 'Round 2 of 6',
    paragraphs: [
      "Vikram Rao sends the quarterly number at 8:47 on a Wednesday - a single CRM screenshot. The number is 101.2% of target. His message reads: 'We hit target. Again.' There is no exclamation mark.",
      "You request the cohort breakdown: performance by individual, by city. What comes back is statistically improbable. Seven of BharatQuick's eleven account managers closed between 98% and 104% of target. Not one is above 110%. Not one is below 95%. It is the kind of uniformity you might expect from a production process - not from a field sales function covering markets as different as Bengaluru's enterprise corridor and Jaipur's SME district.",
      "Vikram calls it soft performance. His theory: the compensation structure is producing exactly the behaviour it is designed to produce. 'Nobody has a reason to close a deal they don't have to close,' he says. 'The math doesn't work for them.' He doesn't elaborate. He doesn't need to.",
      "The board's revenue growth projection for the IPO prospectus assumes compound quarterly growth of 18%. The last two quarters came in at 6.3% and 7.1%. The underwriter's deadline is five quarters away.",
    ],
    available_actions: [
      { name: 'Sales Accelerator Multiplier', description: 'Set the commission rate multiplier that activates when a sales employee exceeds 100% of their quarterly target.' },
      { name: 'Merit Pool', description: 'Allocate a percentage salary increase across all employees, weighted by performance rating.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations with individual employees from the roster.' },
    ],
  },
  3: {
    title: 'The Equity Whistleblower',
    act: 'Round 3 of 6',
    paragraphs: [
      "The screenshot appears in the company's all-staff Slack channel at 11:47 PM on a Thursday. By the time the first manager notices and escalates to Internal Comms Friday morning, it has been viewed 340 times. The image shows a redacted version of the Bengaluru Technology team's merit summary from the prior round - pay ranges, averages, and one annotation added by an unknown sender: 'This is what the app team gets. This is what we get. Same company.'",
      "The Jaipur Hub Manager, Neeraj Sharma, is in the CHRO's office by 9 AM. He is not angry in the way you might expect. He is precise. He has done the calculation himself - average pay positioning for his operations team against the Bengaluru Tech cohort, normalised for city tier. His opening: 'I'm not asking for the same salary. I'm asking for the same logic.'",
      "Company Counsel has already flagged the legal dimension. A visible pay disparity between departments that maps along functional lines - technology versus operations - has potential exposure under equal remuneration provisions if it cannot be justified by documented, objective criteria. SEBI's listing obligations require a clean pay equity declaration in the DRHP. Internal Comms has a CEO statement drafted for the all-hands. Legal has put a hold on sending it until the Compensation function can confirm what, specifically, is being done.",
      "Three individual HR escalations are in your inbox this morning. Different names, different cities, different roles. The same underlying question.",
    ],
    available_actions: [
      { name: 'Equity Adjustment Pool', description: 'Direct a discretionary budget toward specific pay anomalies across the workforce.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations with individual employees from the roster.' },
      { name: 'Promotion Decisions', description: 'Nominate up to 2 employees for a grade-level promotion with a 15% CTC increase.' },
      { name: 'Merit Pool', description: 'Allocate a percentage salary increase across all employees, weighted by performance rating.' },
    ],
  },
  4: {
    title: 'The Dubai Calling',
    act: 'Round 4 of 6',
    paragraphs: [
      "The email arrives at 8:15 AM on a Monday. It is from Sneha Iyer, your highest-rated QA Engineer in Mysore. The subject line: 'A conversation I owe you.' The body is brief. She has received a formal written offer from a fintech startup headquartered in Dubai. The compensation is in AED, tax-free. Relocation is fully covered. The role is a step up in seniority. She has until Thursday.",
      "You pull her file. Performance rating: 5 out of 5 for three consecutive cycles. Current CTC: ₹11.2 lakhs. Market median for her role in a Tier-4 city: ₹15.4 lakhs. The Dubai offer, converted and adjusted for purchasing power, is equivalent to roughly ₹32 lakhs in effective annual value. BharatQuick's standard merit mechanism cannot close this gap in a single round.",
      "The same week, your talent intelligence team flags two related developments. A Dubai-based logistics company has opened an active India sourcing pipeline targeting operations managers in Tier-2 and Tier-3 cities. Two other employees from BharatQuick's Tier-3 roster have been approached - neither has disclosed this to HR. The recruiter's reported pitch: 'You can't compete with tax-free AED on an INR fixed salary.'",
      "Board Chair Meera Krishnan calls at 10 AM. She has seen the same note. Her question is not about Sneha specifically: 'What is BharatQuick's protocol when an international offer materially outprices every domestic retention tool we have? Because this is not the last time.'",
    ],
    available_actions: [
      { name: 'Executive LTI Mix', description: 'Set the proportion of executive variable pay allocated as long-term equity rather than immediate cash.' },
      { name: 'Merit Pool', description: 'Allocate a percentage salary increase across all employees, weighted by performance rating.' },
      { name: 'Equity Adjustment Pool', description: 'Direct a discretionary budget toward specific pay anomalies in the workforce.' },
      { name: 'Promotion Decisions', description: 'Nominate up to 2 employees for a grade-level promotion with a 15% CTC increase.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations with individual employees from the roster.' },
    ],
  },
  5: {
    title: 'The Agency Problem',
    act: 'Round 5 of 6',
    paragraphs: [
      "The Strategy team's quarterly review arrives Thursday afternoon. It is 42 pages, and the relevant section is on page 31. Three of BharatQuick's five Division Heads received their maximum short-term incentive payout last quarter - 140% of target bonus, based on divisional EBITDA. The same three divisions have collectively deferred ₹4.2 crores of R&D commitments, paused three strategic vendor relationships, and authorized headcount freezes that have delayed two product launches by an average of six weeks. The quarterly numbers look exceptional. The three-year view requires a different analysis.",
      "Kotak Mahindra Capital's governance team has formally requested, as part of the pre-IPO review, documentation demonstrating that executive incentives are 'structured to reward long-term value creation.' This is standard underwriter language - but it is language that BharatQuick's current compensation architecture does not obviously satisfy. The request is now on the pre-IPO checklist with a response deadline two weeks before the filing window.",
      "You meet with two Division Heads informally over the week. One is candid: 'I manage for the number I'm paid on. Everyone does. Change the number, you change the behaviour.' The other asks a pointed question about vesting schedules and what happens to unvested equity if the IPO window is delayed. Both conversations confirm the same dynamic.",
      "The Board's governance committee meets in three weeks. They will ask for a written summary of what is being done to address executive compensation alignment before the IPO.",
    ],
    available_actions: [
      { name: 'Executive LTI Mix', description: 'Set the proportion of executive variable pay allocated as long-term equity rather than short-term cash.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 confidential conversations with senior employees from the roster.' },
      { name: 'Merit Pool', description: 'Allocate a percentage increase across all salaries, weighted by performance rating.' },
    ],
  },
  6: {
    title: 'The IPO Exit Interview',
    act: 'Round 6 of 6',
    paragraphs: [
      "The Kotak Mahindra Capital due diligence team arrives Monday morning - four people, laptops, printed summaries of the last five rounds of decisions, and the careful neutrality of reviewers who have already formed initial views. They are here for three days. The sign on the boardroom door reads: People Due Diligence - BharatQuick IPO Review.",
      "Every compensation decision you have made across five quarters is now a line item in their analysis. The merit pools, the equity adjustments, the accelerator settings, the promotions, the LTI structure - each will be evaluated against three questions: Is it internally equitable? Is it market-competitive? Is it sustainable at the growth trajectory projected in the prospectus? The auditors are not looking for perfection. They are looking for coherence.",
      "The Human Equity Score you carry into this round is the cumulative result of those decisions. CHRO Ananya Mehta has briefed the audit team: your HES will be cited as the primary governance metric for the People Risk section of the DRHP. A strong score signals a well-governed compensation function. A weak one may require risk factor disclosure in the prospectus - one that Sequoia and retail investors will read.",
      "This is the final round. The decisions you make here complete the record. Whatever the data is telling you - about remaining gaps, about stability, about what the auditors will scrutinise - this is the moment to act on it.",
    ],
    available_actions: [
      { name: 'Merit Pool', description: 'Final salary allocation - this rate will be reviewed as part of the IPO cost sustainability assessment.' },
      { name: 'Equity Adjustment Pool', description: 'Address any remaining pay anomalies before the audit concludes.' },
      { name: 'Executive LTI Mix', description: 'Final executive long-term incentive proportion - directly reviewed by the governance committee.' },
      { name: 'Sales Accelerator Multiplier', description: 'Final variable pay multiplier for the sales function.' },
      { name: '1-on-1 Interviews', description: 'Conduct up to 4 final confidential conversations to inform your last-round submissions.' },
      { name: 'Promotion Decisions', description: 'Nominate up to 2 employees for a final grade change before the audit closes.' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  EMPLOYEE PULSE REGISTRY - Confidential 1-on-1 content
// ─────────────────────────────────────────────────────────────

export const EMPLOYEE_PULSE: Record<number, Record<string, string>> = {
  1: {
    S1: "I hit 100% every quarter. Consistently. But the commission structure does not differentiate between someone at 100% and someone at 140%. So I hit 100% and stop. That's not laziness - that's math. If the math changes, my behaviour changes.",
    N1: "I've been benchmarking. The gap between my current CTC and what comparable roles at Swiggy and Zepto are advertising is somewhere around 30 to 35 percent. I'm not ready to move yet. But I'm also not not looking.",
    N5: "In Bengaluru they talk about traffic while earning three times my salary. I do the same QA work from Mysore. Yes, my rent is lower. It is not one-third lower. I'd like to understand how BharatQuick actually thinks about what my work is worth to this company.",
    E1: "I need to see the pay equity numbers before anyone else does. If there's a fault line between Tech and Ops and it surfaces in the IPO filing without us having addressed it, that's not a PR problem. It's a governance failure. Fix it before it becomes one.",
  },
  2: {
    S1: "A colleague at a competitor just received an accelerator payout that exceeded my annual variable. He closed 145% of target. I closed 138%. The difference: his firm pays double the commission rate above 100%. I'm having conversations I probably shouldn't be having yet.",
    E1: "The board is watching variable pay design carefully ahead of the listing. Personally, I need a larger stake in the long-term outcome - not more cash now. Cash doesn't make me think like an owner. Equity does.",
    S4: "My targets were built on Bengaluru conversion rates. I'm selling to SMEs in Jaipur with different payment cycles and smaller ticket sizes. I'm not underperforming. The benchmark is wrong for my market.",
    N3: "I've been at this grade for three years. My performance hasn't dropped below 5 in any of them. I have an offer from a multinational that includes a level promotion. I'm here because I wanted to have this conversation first.",
  },
  3: {
    N6: "I sent the screenshot. Yes. I stand by it. I'm not asking for the Bengaluru salary. I'm asking for the same internal logic - if performance and market positioning drive pay, that logic should apply regardless of which team you're on. Right now it doesn't.",
    N3: "The Unilever offer came through in writing this morning. ₹31 lakhs, P4 equivalent, Mumbai. My deadline is Friday. I'm here because I was told the compensation review was underway. I need to know what that means, specifically.",
    S1: "The accelerator conversation is helping the team's mindset slightly, but the equity situation is creating noise. Delivery managers are now asking their leads about salaries. Those leads are asking me. I don't have answers to give.",
    E2: "My bonus hit maximum last quarter. Honestly, I made three decisions in Q4 that I knew were better for my bonus than for the company's plan. The incentive structure is pulling me in the wrong direction. Someone senior needs to address that.",
  },
  4: {
    N5: "I have the offer in writing in front of me. Dubai. Tax-free. Relocation covered. They want an answer by Thursday. BharatQuick has been my whole career. But this is not a salary conversation anymore - it's a fundamentally different financial outcome. I need to see something real on paper before I can say no.",
    N6: "After last round the Jaipur team feels slightly more settled - but slightly isn't secure. Two leads have also been approached by international firms. How BharatQuick responds to Sneha will signal something about how the company values Tier-3 talent. That signal matters more than people realise.",
    S4: "If Sneha leaves, I'll take it as confirmation of something I've already suspected. I'll start having conversations I've been putting off.",
  },
  5: {
    E1: "The LTI rebalancing is the right structural move. If my variable pay is tied to the IPO outcome, I start making three-year decisions instead of three-month ones. But the other executives won't see it as structural improvement immediately. They'll see a reduction in their quarterly cash. You need to get ahead of that narrative.",
    E2: "I've read the proposal. I understand the agency theory argument - honestly, I recognise myself in it. But if we shift to 50% LTI and the IPO underperforms or is delayed, I've taken a significant personal financial risk for an outcome I can't fully control. What protections exist?",
    N3: "I stayed. The promotion made the difference - I need you to know that. The next question I have is about the path from here. What does progression to the next level look like, and who controls that decision?",
  },
  6: {
    E1: "The due diligence team asked me directly: is your compensation architecture designed for the next three years, or is it a reaction to the last three crises? I told them it was designed. I need you to make sure that answer holds up.",
    N5: "I stayed. The LTI offer was the deciding factor - more than the merit increase. If BharatQuick's IPO delivers, this will have been the best decision of my career. I'm committed.",
    S1: "The accelerator changed everything. Last quarter was 168% of target - my best ever. I stopped looking at other options. The math finally works.",
    N6: "Jaipur is stable. Not euphoric - stable. People are watching the IPO outcome as closely as their next performance cycle. Both matter.",
  },
};

// ─────────────────────────────────────────────────────────────
//  NARRATIVE DOSSIER - Game dashboard Situation tab
// ─────────────────────────────────────────────────────────────

export const NARRATIVE_DOSSIER = {
  ceo_memo: {
    title: 'Project Phoenix - Executive Mandate',
    author: 'Arjun Kapoor, Group CEO · BharatQuick',
    content: `I want to be direct. We are eighteen months from the IPO window, and our People Risk score is the weakest item in the Sequoia due diligence report. That is not acceptable.

BharatQuick is expanding at a compressed growth cycle, but our compensation architecture is a legacy fixed-cost model from our Series B days. It was built for 600 employees across one city. We have 4,200 across 38.

I am not asking for cost-of-living adjustments dressed up as strategy. I want a framework that makes our best people genuinely untouchable by competitors - while fixing the internal equity gaps that are creating departmental friction and putting our IPO governance record at risk.

The clock is ticking. What happens next is your decision.`,
  },
  board_intercept: {
    title: 'Pre-IPO People Risk Assessment - Confidential',
    author: 'Meera Krishnan, Board Chair · For Compensation function only',
    content: `This document summarises the Board's key observations from Q3 talent data. Not for distribution beyond the CHRO and Compensation function.

The Operations team in Tier-2 and Tier-3 cities is acutely aware of the Bengaluru Tech cohort's compensation premium. In the last Pulse Survey, 62% of Operations employees rated internal pay fairness as their top dissatisfaction driver. We assess this as a moderate-to-high collective action risk if not addressed within the next two decision cycles.

The current linear commission structure has produced a measurable performance ceiling in the sales function. Top performers are hitting target and disengaging. This is a structural design flaw, not a motivation problem.

Short-term incentive payouts for three Division Heads in Q3 reached maximum while their divisions underperformed on six-month strategic KPIs. The Board requires LTI rebalancing before the underwriter's governance review concludes.`,
  },
};

// ─────────────────────────────────────────────────────────────
//  CASE STUDY BRIEFING - Strategic roadmap (dashboard)
// ─────────────────────────────────────────────────────────────

export const CASE_STUDY_BRIEFING = {
  strategic_roadmap: {
    1: 'Baseline Audit - Assess current pay positioning and identify initial equity gaps',
    2: 'Performance Design - Address the sales plateau with non-linear variable pay',
    3: 'Equity Intervention - Resolve cross-functional pay fault lines before regulatory exposure',
    4: 'Retention Crisis - Respond to international poaching with a sustainable retention approach',
    5: 'Executive Alignment - Rebalance LTI/STI mix to align leadership with IPO value creation',
    6: 'IPO Certification - Complete People Due Diligence with a clean, defensible compensation record',
  },
};

// ─────────────────────────────────────────────────────────────
//  DYNAMIC MARKET SIGNALS - Distractors & Data per Round
// ─────────────────────────────────────────────────────────────

export const MARKET_SIGNALS_PER_ROUND: Record<number, any[]> = {
  1: [
    { label: 'Competitor Intel', level: 'Noise', note: 'DunzoScale announces a freeze on base pay hikes to focus entirely on variable bonuses. (Aon Hewitt disputes this approach).' },
    { label: 'Bengaluru Tech', level: 'Critical', note: 'Tier-1 engineering talent now treats LTI as a primary decision factor. Firms without meaningful equity upside are screened out.' },
    { label: 'Macro Report', level: 'Noise', note: 'Consumer inflation in Tier-3 cities hits 7%. Labor unions pushing for flat rupee increases.' }
  ],
  2: [
    { label: 'Sales Sector', level: 'High', note: 'Competitor SwiggyInsta launched a 2.5x accelerator last month. Three BharatQuick AMs have since accepted recruiter calls.' },
    { label: 'Startup Rumor', level: 'Noise', note: 'A leak suggests a major competitor is eliminating commissions entirely in favor of high fixed salaries. Unverified.' },
    { label: 'Market Study', level: 'Critical', note: 'Data shows Tier-2 operations talent values 15% base pay increases more than 30% variable pay.' }
  ],
  3: [
    { label: 'Internal Comms', level: 'Noise', note: 'Survey results say 80% of employees want free gym memberships instead of higher bonuses. (HR flagged as low sample size).' },
    { label: 'Compliance Risk', level: 'Critical', note: 'SEBI tightens pay disparity reporting. Any department-level variance above 15% will require formal Board justification.' },
    { label: 'Industry Trend', level: 'Noise', note: 'Articles claim the "Matrix Formula" for variable pay is dead and subjective bonuses are returning.' }
  ],
  4: [
    { label: 'Expat Market', level: 'Critical', note: 'Dubai and Singapore logistics firms are actively targeting India\'s top 5% performers with 2x tax-free multipliers.' },
    { label: 'VC Advice', level: 'Noise', note: 'A board advisor suggests cutting LTI entirely to boost short-term EBITDA. (Directly contradicts IPO underwriter requirements).' },
    { label: 'Benchmarking', level: 'High', note: 'Standard 4-year linear vesting is losing ground to 1-year cliffs with massive back-weighted 4th year payouts to trap talent.' }
  ],
  5: [
    { label: 'Underwriter Note', level: 'Critical', note: 'Kotak Mahindra explicitly warns that executive cash bonuses exceeding 60% of total comp will trigger a governance flag.' },
    { label: 'Executive Gossip', level: 'Noise', note: 'Rumors that the VP of Sales will quit if LTI mix exceeds 20%. (Unlikely given his recent stock purchases).' },
    { label: 'Market Study', level: 'Noise', note: 'Executives claim they work 40% harder when base pay is reduced. (Study funded by a VC firm).' }
  ],
  6: [
    { label: 'Audit Committee', level: 'Critical', note: 'The IPO auditors will mathematically fail the compensation architecture if discretionary budgets are exceeded.' },
    { label: 'VP Ultimatum', level: 'High', note: 'Sneha (N5) and other critical nodes are demanding immediate out-of-cycle retention grants or they walk.' },
    { label: 'Noise', level: 'Noise', note: 'An anonymous Slack message claims the company is bankrupt. (Finance confirms ₹1,200 Cr in bank).' }
  ]
};

