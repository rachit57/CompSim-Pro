function getThemeConfig(theme) {
  const themes = {
    'hyper_scale': {
      name: 'HyperScale SaaS',
      startingBudget: 12000000,
      baseTurnover: 0.12,
      industryModifiers: { equityImportance: 1.5, basePayImportance: 0.8 }
    },
    'legacy_manufacturing': {
      name: 'Legacy Manufacturing',
      startingBudget: 18000000,
      baseTurnover: 0.04,
      industryModifiers: { unionRisk: 1.2, benefitsImportance: 1.5 }
    },
    'healthcare': {
      name: 'Healthcare Horizon',
      startingBudget: 22000000,
      baseTurnover: 0.18,
      industryModifiers: { burnoutRisk: 1.4, basePayImportance: 1.2 }
    },
    'investment_banking': {
      name: 'Investment Banking',
      startingBudget: 35000000,
      baseTurnover: 0.08,
      industryModifiers: { bonusImportance: 2.0, regulatoryRisk: 1.5 }
    },
    'global_expansion': {
      name: 'Global Expansion',
      startingBudget: 15000000,
      baseTurnover: 0.10,
      industryModifiers: { localizationImportance: 1.5, parityRisk: 1.3 }
    }
  };

  return themes[theme] || themes['hyper_scale'];
}

module.exports = { getThemeConfig };
