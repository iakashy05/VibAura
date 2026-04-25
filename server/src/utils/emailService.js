import nodemailer from 'nodemailer';

/**
 * Send an email using Nodemailer.
 * Requires EMAIL_USER and EMAIL_PASS in .env.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Defaulting to Gmail for ease of use
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"VibAura Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Error sending email: ${error.message}`);
    // If not configured, we still want the app to function (fallback to terminal)
    return false;
  }
};
