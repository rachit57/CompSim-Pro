export const NARRATIVE_DOSSIER = {
  ceo_memo: {
    title: "BharatQuick: The Mid-Year Reckoning",
    author: "Ishaan Kapur, Group CEO",
    content: `Team, the board has been breathing down my neck. We are growing at 30% month-on-month, but our 'Quick-Commerce' division is leaking money and people. 

We need to decide: are we a high-growth Disruptor or a legacy FMCG giant? Our pay strategy reflects our identity. If we want to win in Bangalore, we can't pay Mysore rates. But if we pay Bangalore rates across the board, we'll be bankrupt by Q3. 

I don't need you to tell me the 'standard merit increment.' I need you to tell me how we stop our competitors from stealing our core. Handle it.`
  },
  board_intercept: {
    title: "CONFIDENTIAL: Internal Board Summary",
    author: "Board Observer 02",
    content: `Observed high levels of 'Sector Jealousy.' The Operations team in Tier-3 cities feels the Bangalore Tech team is being prioritized with the lion's share of the budget. 

There's also a worrying trend in the Sales division: top performers are hitting targets and then 'coasting' for the rest of the month. They aren't incentivized for the extra mile. The Compensation Lead needs to find a way to make performance exponential, not linear.`
  },
  market_gossip: {
    title: "Intelligence Hub: Glassdoor & Market Heatmap",
    content: `RECENT UPDATES:
- **Bangalore (Tier 1)**: Senior Tech talent is now looking at LTI (Stock Options) as a primary decision factor. 
- **Sales Sector**: Rival firm 'DunzoScale' just introduced 2x accelerators for their account managers. 
- **The Dubai Exit**: We've seen a spike in Tier-2 managers taking 'Expat' offers for UAE-based startups. Tax-free cash is hard to fight with fixed INR base pay.`
  }
};

export const ROUND_STORIES = {
  1: {
    title: "The Silent Exodus",
    story: "It's quiet—too quiet. Your first audit shows the workforce is stable on the surface, but the 1-on-1 reports suggest a deep undercurrent of comparison. No one is telling you what to change; you'll have to find the gaps yourself."
  },
  2: {
    title: "The Quota Plateau",
    story: "Sales targets are being met, but they aren't being crushed. The Board is asking why our growth has flattened. There's a rumor that the 'Sales Vibe' is off—the stars feel like they're carrying the weight of the laggards."
  },
  3: {
    title: "The Equity Whistleblower",
    story: "A confidential report has landed on your desk. Someone leaked the 'Tech Merits' to the 'Operations' floor. Internal Equity isn't just a number anymore—it's a potential strike."
  },
  4: {
    title: "The Dubai Calling (Crisis)",
    story: "CRISIS: Sneha in Mysore just received an offer from a fintech in Dubai. She's a high-performer in a Tier-4 city. This isn't just about her; it's a test of our 'International' retention strategy. Do we bend, or do we break?"
  },
  5: {
    title: "The Agency Problem",
    story: "The Executive team is chasing short-term quarterly bonuses at the expense of our long-term R&D. We need to realign their DNA with the company's 3-year plan."
  },
  6: {
    title: "The IPO Exit Interview",
    story: "Investors are doing their final walk-through. Every decision you've made—every promotion, every accelerator—is being scrutinized for its 'Sustainability Index.' Finish the job."
  }
};

// --- EMPLOYEE PULSE REGISTRY (The Hidden Clues) ---
export const EMPLOYEE_PULSE: Record<number, Record<string, string>> = {
  1: {
    'S1': "I'm hitting target easily. But honestly? Why push for 150% when the commission is the same? I'd rather spend the time with my family.",
    'N1': "I see what's happening at Swiggy. They are offering 40% more in RSUs. We are still talking about 'fixed yearly bonus.' It feels... old.",
    'N5': "People in Bangalore complain about traffic while taking 3x my salary. I do the same QA work from Mysore. Is my rent *that* much cheaper?"
  },
  2: {
    'S1': "My buddy at another firm just got a massive 'Accelerator' check. He bought a car. I got a 'Thank You' email from the CEO. Guess who's browsing JobSarta today?",
    'E1': "The Board is worried about the IPO. I need to see more variable pay in my mix. I want more 'skin in the game.'",
    'S4': "Target is a bit high for Jaipur market. I'm doing my best but I feel like I'm being set up to fail."
  },
  3: {
    'N6': "The Tech guys got all the attention last round. We manage the actual deliveries. If we don't see a fair equity pool soon, the Jaipur hub might 'slow down' significantly.",
    'N3': "I've been at P3 for three years. My performance is 5. If I don't see a promotion path soon, I'm taking that offer from Unilever."
  },
  4: {
    'N5': "Dubai is offering me tax-free income and a relocation package for an Expat role. Mysore is great, but that's life-changing money. What's BharatQuick going to do? Tell me about the 'culture' again?"
  }
};
