/**
 * Email Utility
 * -----------------------------------------------------
 * This file handles all email sending logic.
 *
 * Features:
 * - Supports SMTP email sending (for production)
 * - Logs email content when SMTP is not configured
 * - Shows verification/reset links in server logs
 */

import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Base URL of the application.
 * Used to generate verification and reset links.
 */
const appUrl = process.env.APP_URL || "http://localhost:5000";

/**
 * Default sender email
 */
const emailFrom = process.env.EMAIL_FROM || "no-reply@productivity-hub.local";

/**
 * Create SMTP transporter if SMTP is configured
 */
function getTransporter() {
  // Option 1: Full SMTP connection string
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  // Option 2: SMTP host configuration
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

/**
 * Generic email sending function
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const transporter = getTransporter();

  // If SMTP is not configured, log the email instead
  if (!transporter) {
    console.log("\n📧 EMAIL SERVICE (DEV MODE)");
    console.log("SMTP not configured. Email not sent.");
    console.log("Recipient:", input.to);
    console.log("Subject:", input.subject);
    console.log("Content:");
    console.log(input.text);
    console.log("-------------------------------------------------\n");

    return;
  }

  // Send email using SMTP
  await transporter.sendMail({
    from: emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

/**
 * Send Email Verification Link
 */
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {

  const verificationLink = `${appUrl}/verify-email?token=${encodeURIComponent(
    token
  )}`;

  console.log("\n🔑 EMAIL VERIFICATION LINK:");
  console.log(verificationLink);
  console.log("-------------------------------------------------\n");

  await sendEmail({
    to,
    subject: "Verify your Productivity Hub email",
    text: `Verify your account by visiting:\n${verificationLink}`,
    html: `
      <p>Welcome to <b>Productivity Hub</b>.</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
    `,
  });
}

/**
 * Send Password Reset Link
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {

  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(
    token
  )}`;

  console.log("\n🔑 PASSWORD RESET LINK:");
  console.log(resetLink);
  console.log("-------------------------------------------------\n");

  await sendEmail({
    to,
    subject: "Reset your Productivity Hub password",
    text: `Reset your password by visiting:\n${resetLink}`,
    html: `
      <p>We received a request to reset your password.</p>
      <p>Use the link below to set a new password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}