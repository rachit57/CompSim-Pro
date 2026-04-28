const nodemailer = require('nodemailer');

/**
 * CompSim Pro Mailer Service ($0 Setup)
 * Uses Nodemailer with standard SMTP (e.g., Gmail, Outlook).
 */

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // e.g. your-email@gmail.com
    pass: process.env.EMAIL_PASSWORD // e.g. an "App Password"
  }
});

async function sendStudentReport(email, playerName, feedback) {
  console.log(`[MAILER] Dispatching report to ${email}...`);
  
  const mailOptions = {
    from: `"CompSim Pro Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Performance Report: CompSim Pro Simulation - ${playerName}`,
    text: `Hello ${playerName},\n\nYour compensation simulation has concluded. Below is your performance analysis and feedback:\n\n${feedback}\n\nThis report was generated automatically by the CompSim Pro Managed Platform.`,
    // If we want a personal touch:
    replyTo: process.env.ADMIN_EMAIL || 'prof@compsim.pro'
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAILER] Successfully sent to ${email}`);
    } else {
      console.log(`[MAILER] EMAIL_USER/PASS not found. Report for ${email} logged to console:`);
      console.log(feedback);
    }
    return true;
  } catch (error) {
    console.error(`[MAILER] Error sending to ${email}:`, error.message);
    return false;
  }
}

async function sendProfessorSummary(profEmail, cohortStats, leaderboard) {
  console.log(`[MAILER] Dispatching Cohort Summary to ${profEmail}...`);

  const leaderboardText = leaderboard
    .map((p, i) => `${i+1}. ${p.email}: HES ${p.score || 0}`)
    .join('\n');

  const text = `
    Dear Professor,

    The simulation session has ended. Here is your cohort analytical summary:

    -----------------------------------------
    COHORT STATISTICS
    -----------------------------------------
    Total Students: ${cohortStats.count}
    Mean HES Score: ${cohortStats.mean.toFixed(2)}
    Standard Deviation: ${cohortStats.stdDev.toFixed(2)}

    SCORE DISTRIBUTION
    0-40:   ${cohortStats.bins['0-40']}
    41-60:  ${cohortStats.bins['41-60']}
    61-80:  ${cohortStats.bins['61-80']}
    81-90:  ${cohortStats.bins['81-90']}
    91-100: ${cohortStats.bins['91-100']}

    TOP 10 LEADERBOARD
    ${leaderboardText}

    All individual student reports have been dispatched.
    -----------------------------------------
  `;

  const mailOptions = {
    from: `"CompSim Pro Analytics" <${process.env.EMAIL_USER}>`,
    to: profEmail,
    subject: `Cohort Summary: CompSim Pro Session Ended`,
    text: text
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions);
      console.log(`[MAILER] Summary sent to Professor ${profEmail}`);
    } else {
      console.log(`[MAILER] EMAIL_USER/PASS not found. Professor summary logged to console.`);
    }
    return true;
  } catch (error) {
    console.error(`[MAILER] Error sending summary to Prof:`, error.message);
    return false;
  }
}

module.exports = { sendStudentReport, sendProfessorSummary };
