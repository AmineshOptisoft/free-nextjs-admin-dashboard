import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export async function sendOtpEmail(to: string, otp: string, role: "customer" | "rider") {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP configuration missing");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subject = "Kadi Password Reset OTP";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Kadi ${role === "customer" ? "Customer" : "Rider"} Password Reset</h2>
      <p>Your OTP is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>This OTP expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Kadi Support" <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
