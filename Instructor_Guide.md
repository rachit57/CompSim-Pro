# CompSim Pro - Instructor & Professor Guide

Welcome to the backend mechanics guide for **CompSim Pro: BharatQuick IPO Simulation**. This document outlines exactly how the proprietary Node.js `gameEngine.js` evaluates student inputs, how the Health & Efficiency Score (HES) is calculated, and what the optimal "Golden Path" decisions are for each round.

---

## 1. The Scoring Engine (HES)

The Health & Efficiency Score (HES) is the ultimate grade for the student. It is calculated out of a maximum of 100 points.

The formula relies heavily on four metrics:
1. **ROI (Max 40 points):** Total performance value retained vs budget spent. Retaining Level 5 performers boosts this.
2. **Engagement (Max 30 points):** Directly inverse to turnover. `(1 - Turnover) * 30`. 
3. **Parity & Equity (Max 30 points):** Driven by the "Grapevine Network". Calculates the statistical variance (`pValue`) between connected peers. High variance drops this score.
4. **Turnover Penalty:** If overall attrition exceeds 10%, a brutal deduction is applied: `(Turnover - 0.10) * 200`.

*Failure Condition:* If a student ignores market benchmarking or fails the IPO governance audits (Round 6), their score will violently crash into the 20s or 30s.

---

## 2. Round-by-Round Guide & Optimal Decisions

### Round 1: Market Correction & Parity
**The Objective:** Identify gross pay disparities using the Grapevine visualizer and issue targeted equity allocations.
* **Optimal Play:** Students must notice which high-performers are making significantly less than underperforming peers they report to or communicate with. Allocate the discretionary budget to bring these critical flight-risk employees up to parity.
* **Why others fail:** Blindly giving 10% raises to everyone wastes budget and doesn't fix the underlying statistical variance (`pValue`), resulting in Grapevine Penalties that tank the HES score.

### Round 2: Geo-Tiering & Benchmarking
**The Objective:** Establish the company's compensation philosophy across different cities (Tier 1 vs 2 vs 3).
* **Optimal Play:** Set Tier 2 multipliers to roughly `0.80x` and Tier 3 to `0.60x`. Target the `P75` or `P90` market percentiles *only* for highly competitive roles (Tech/Sales), and `P50` for Operations. 
* **Why others fail:** If a student targets `P90` for everyone, the simulation dynamically inflates the `marketMid` for the entire workforce. Because their actual `currentPay` hasn't changed yet, their Comp-Ratio drops below `0.85` across the board, triggering mass attrition warnings.

### Round 3: Advanced Formula Builder
**The Objective:** Build a balanced variable pay formula totaling 100 points, and set the performance payout curve.
* **Optimal Play:** The parameter weights must strictly sum to exactly 100. The curve should heavily differentiate top talent (e.g., Perf 1 = `0.0x`, Perf 3 = `1.0x`, Perf 5 = `2.0x`).
* **Why others fail:** If the parameters sum to 90 or 110, the backend voids the bonus plan, destroying engagement. If the curve is too flat (e.g., Perf 5 gets `1.2x`), high performers will quit because their variable pay is uncompetitive compared to the market.

### Round 4: LTI Vesting & Retention
**The Objective:** Issue Long Term Incentives (Equity/Stock) to lock in critical talent before the IPO.
* **Optimal Play:** Select a standard 4-Year Linear vesting schedule. Issue "Major Grants" exclusively to high performers (Performance 4 & 5) who have low Comp-Ratios. 
* **Why others fail:** Giving LTI grants to low performers lowers the ROI metric. Selecting the "1-Year Cliff" causes employees to cash out and quit immediately after the cliff, increasing long-term attrition risk. 

### Round 5: Variable Payout Execution
**The Objective:** Review the mathematical execution of the Round 3 variable payout formula and the Executive Scorecard.
* **Optimal Play:** Balance the Sales Accelerator and Executive PSU Mix to ensure executives have skin in the game without draining the cash reserves.
* **Why others fail:** If the student's Round 3 curve was overly generous (e.g., paying 2.0x to average performers), the backend executes those payouts here, completely obliterating the `Budget Utilization` metric and tanking their score.

### Round 6: Exception Triage & The IPO Audit
**The Objective:** Retain 4 critical Tier-1 VIPs using a hard-capped discretionary budget of exactly ₹2,000,000.
* **Optimal Play:** Students must strictly calculate how to allocate the ₹20L to the flight-risk VIPs whose Comp-Ratios are the lowest. They must *not* spend more than ₹2,000,000, even if it means letting one VIP walk.
* **Why others fail:** This is a trap. If a student overspends the ₹20L limit (e.g., giving 10L to all 4 VIPs), the backend triggers a "Governance Failure" IPO audit penalty. The board steps in and permanently zeroes out all Executive LTI (`emp.lti = 0`), which immediately triggers a mass executive walkout and drops the final HES score.

---

## 3. The "Grapevine" Mechanics (Backend Algorithm)
The simulation uses a directed graph to calculate pay parity:
1. Every employee has an array of `connections` (peers they talk to about their salary).
2. The engine calculates the `peerAverageRatio`.
3. If an employee's Comp-Ratio is $< 0.90$ AND their `peerAverageRatio` is $> 1.10$, it triggers a `GrapevinePenalty`.
4. This penalty directly forces the employee into the `AttritionRisk` pool, meaning they will randomly quit at the end of the round.
5. **Takeaway:** Pay transparency is simulated dynamically. You cannot hide underpaying a high performer if they are networked with overpaid low performers.
