function initializeFaultLines() {
  return {
    payCompression: 0,
    benefitsAdequacy: 0,
    leadershipPayGap: 0,
    recognitionDrought: 0
  };
}

function updateFaultLines(currentFaults, decisions) {
  let newFaults = { ...currentFaults };

  // Pay Compression Fault
  if (decisions.basePayAdj > 0.08) {
    newFaults.payCompression += 25;
  }

  // Benefits Adequacy Fault
  if (decisions.benefits === 'low') {
    newFaults.benefitsAdequacy += 30;
  } else if (decisions.benefits === 'high') {
    newFaults.benefitsAdequacy = Math.max(0, newFaults.benefitsAdequacy - 20);
  }

  // Leadership Pay Gap Default
  if (decisions.variablePay > 0.25) {
     newFaults.leadershipPayGap += 20;
  }

  // Recognition Drought Fault
  if (decisions.communication < 0.2) {
     newFaults.recognitionDrought += 25;
  } else {
     newFaults.recognitionDrought = Math.max(0, newFaults.recognitionDrought - 15);
  }

  return newFaults;
}

function checkFaultCrises(faults) {
  let activeCrisis = null;
  if (faults.payCompression >= 100) {
    activeCrisis = { type: 'FaultCrisis', message: 'Pay compression has reached critical levels! Mass walkout imminent.' };
  } else if (faults.benefitsAdequacy >= 100) {
    activeCrisis = { type: 'FaultCrisis', message: 'Benefits inadequacy has triggered a union vote.' };
  }
  // Reset if triggered (simplified)
  return activeCrisis;
}

module.exports = { initializeFaultLines, updateFaultLines, checkFaultCrises };
