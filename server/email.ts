import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const appUrl = process.env.APP_URL || "http://localhost:5000";
const emailFrom = process.env.EMAIL_FROM || "no-reply@productivity-hub.local";

function getTransporter() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[email] SMTP not configured. Email skipped for ${input.to}: ${input.subject}`);
    console.info(input.text);
    return;
  }

  await transporter.sendMail({
    from: emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verificationLink = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Verify your Productivity Hub email",
    text: `Verify your account by visiting: ${verificationLink}`,
    html: `
      <p>Welcome to Productivity Hub.</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Reset your Productivity Hub password",
    text: `Reset your password by visiting: ${resetLink}`,
    html: `
      <p>We received a request to reset your password.</p>
      <p>Use this link to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}
