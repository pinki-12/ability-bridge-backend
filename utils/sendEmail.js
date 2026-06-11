const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[Email skipped - no config] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"AbilityBridge" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f5f3ef; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0d7377; font-size: 24px; margin: 0;">AbilityBridge</h1>
          <p style="color: #777; font-size: 12px; margin: 4px 0 0;">Inclusive Employment Platform</p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 28px; color: #0f1117; line-height: 1.7;">
          ${text.replace(/\n/g, "<br>")}
        </div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
          © 2025 AbilityBridge — Building an inclusive workforce
        </p>
      </div>
    `,
  });
};

module.exports = sendEmail;
