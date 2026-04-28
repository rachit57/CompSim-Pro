/**
 * CompSim Pro Mailer Service
 * Handles dispatching reports to students and professors.
 */

// Placeholder for Resend / Nodemailer
// Usage: const resend = new Resend(process.env.RESEND_API_KEY);

async function sendStudentReport(email, playerName, feedback) {
  console.log(`[MAILER] Preparing report for ${email}...`);
  
  const msg = {
    from: 'CompSim Pro <reports@compsim.pro>',
    to: email,
    subject: `CompSim Pro: Your Performance Report - ${playerName}`,
    text: `Hello ${playerName},\n\nThank you for participating in the CompSim Pro Simulation.\n\n${feedback}\n\nBest Regards,\nCompSim Pro Platform`,
  };

  // In production, uncomment the actual mailer call:
  // await resend.emails.send(msg);
  
  console.log(`[MAILER] Report sent to ${email} (Simulation Mode)`);
  return true;
}

async function sendProfessorSummary(profEmail, cohortStats, leaderboard) {
  console.log(`[MAILER] Preparing cohort summary for ${profEmail}...`);

  const leaderboardText = leaderboard
    .map((p, i) => `${i+1}. ${p.email}: HES ${p.score}`)
    .join('\n');

  const text = `
    Professor,

    The simulation session has ended. Here is the cohort summary:

    Active Students: ${cohortStats.count}
    Average HES Score: ${cohortStats.mean.toFixed(2)}
    Standard Deviation: ${cohortStats.stdDev.toFixed(2)}

    Score Distribution:
    0-40:   ${cohortStats.bins['0-40']}
    41-60:  ${cohortStats.bins['41-60']}
    61-80:  ${cohortStats.bins['61-80']}
    81-90:  ${cohortStats.bins['81-90']}
    91-100: ${cohortStats.bins['91-100']}

    Top Performers:
    ${leaderboardText}

    The individual reports have been dispatched to all students.
  `;

  console.log(`[MAILER] Professor summary sent to ${profEmail} (Simulation Mode)`);
  return true;
}

module.exports = { sendStudentReport, sendProfessorSummary };
