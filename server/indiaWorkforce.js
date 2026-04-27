const workforce = [
  // --- EXECUTIVES (DELHI - TIER 1) ---
  { id: 'E1', name: 'Arjun Mehta', level: 'M2', role: 'VP Operations', city: 'Delhi', tier: 1, currentPay: 8500000, marketMid: 9200000, performance: 5, dept: 'Operations', gender: 'M', type: 'executive', sto: 0.3, lti: 0.4, managerId: null, connections: ['E2', 'E3'] },
  { id: 'E2', name: 'Priya Iyer', name_safe: 'Priya I.', level: 'M1', role: 'Director Product', city: 'Bangalore', tier: 1, currentPay: 8200000, marketMid: 6000000, performance: 4, dept: 'Product', gender: 'F', type: 'executive', sto: 0.25, lti: 0.3, managerId: 'E1', connections: ['E1', 'S1', 'N1'] },
  { id: 'E3', name: 'Sanjay Gupta', level: 'M1', role: 'Director Supply Chain', city: 'Mumbai', tier: 1, currentPay: 5500000, marketMid: 5800000, performance: 3, dept: 'Supply Chain', gender: 'M', type: 'executive', sto: 0.2, lti: 0.2, managerId: 'E1', connections: ['E1', 'N3', 'N6'] },

  // --- SALES STARS (BANGALORE - TIER 1) ---
  { id: 'S1', name: 'Aarav Singh', level: 'P4', role: 'Key Account Manager', city: 'Bangalore', tier: 1, currentPay: 2200000, marketMid: 2400000, performance: 5, dept: 'Sales', gender: 'M', type: 'sales', commissionRate: 0.1, accelerator: 1.5, achievement: 1.2, managerId: 'E2', connections: ['E2', 'S2', 'S3'] },
  { id: 'S2', name: 'Neha Sharma', level: 'P3', role: 'Regional Sales Lead', city: 'Pune', tier: 2, currentPay: 1800000, marketMid: 1750000, performance: 4, dept: 'Sales', gender: 'F', type: 'sales', commissionRate: 0.08, accelerator: 1.3, achievement: 0.95, managerId: 'S1', connections: ['S1', 'S4', 'N4'] },
  { id: 'S3', name: 'Vikram Rao', level: 'P2', role: 'Sales Executive', city: 'Hyderabad', tier: 2, currentPay: 1400000, marketMid: 2000000, performance: 3, dept: 'Sales', gender: 'M', type: 'sales', commissionRate: 0.05, accelerator: 1.2, achievement: 1.05, managerId: 'S1', connections: ['S1', 'N2'] },
  { id: 'S4', name: 'Ananya Das', level: 'P1', role: 'Inside Sales', city: 'Jaipur', tier: 3, currentPay: 850000, marketMid: 800000, performance: 4, dept: 'Sales', gender: 'F', type: 'sales', commissionRate: 0.05, accelerator: 1.2, achievement: 0.8, managerId: 'S2', connections: ['S2', 'N6'] },

  // --- NORMAL STAFF (TECH & OPS) ---
  { id: 'N1', name: 'Rohan Verma', level: 'P5', role: 'Sr. Backend Engineer', city: 'Bangalore', tier: 1, currentPay: 4200000, marketMid: 6000000, performance: 5, dept: 'Tech', gender: 'M', type: 'normal', managerId: 'E2', connections: ['E2', 'N2', 'N5'] },
  { id: 'N2', name: 'Kavita Reddy', level: 'P4', role: 'Product Manager', city: 'Hyderabad', tier: 2, currentPay: 3200000, marketMid: 3000000, performance: 4, dept: 'Product', gender: 'F', type: 'normal', managerId: 'N1', connections: ['N1', 'S3'] },
  { id: 'N3', name: 'Amit Patel', level: 'P3', role: 'Supply Chain Analyst', city: 'Ahmedabad', tier: 2, currentPay: 1400000, marketMid: 1550000, performance: 3, dept: 'Supply Chain', gender: 'M', type: 'normal', managerId: 'E3', connections: ['E3', 'N6'] },
  { id: 'N4', name: 'Ishaan Malhotra', level: 'P3', role: 'UX Designer', city: 'Pune', tier: 2, currentPay: 1900000, marketMid: 1800000, performance: 4, dept: 'Tech', gender: 'M', type: 'normal', managerId: 'N1', connections: ['S2'] },
  { id: 'N5', name: 'Sneha Kulkarni', level: 'P2', role: 'QA Engineer', city: 'Mysore', tier: 4, currentPay: 600000, marketMid: 950000, performance: 2, dept: 'Tech', gender: 'F', type: 'normal', managerId: 'N1', connections: ['N1'] },
  { id: 'N6', name: 'Raj Kumar', level: 'P2', role: 'Logistics Lead', city: 'Jaipur', tier: 3, currentPay: 1400000, marketMid: 1050000, performance: 4, dept: 'Operations', gender: 'M', type: 'normal', managerId: 'E3', connections: ['E3', 'N3', 'S4', 'N7'] },
  { id: 'N7', name: 'Deepa Nair', level: 'P1', role: 'Customer Support', city: 'Kochi', tier: 3, currentPay: 550000, marketMid: 600000, performance: 3, dept: 'Operations', gender: 'F', type: 'normal', managerId: 'N6', connections: ['N6', 'N8'] },
  { id: 'N8', name: 'Zoya Khan', level: 'P1', role: 'Junior HR', city: 'Indore', tier: 3, currentPay: 350000, marketMid: 520000, performance: 5, dept: 'HR', gender: 'F', type: 'normal', managerId: 'E1', connections: ['N7'] }
];

module.exports = { workforce };
