import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || "TARA DELIVERY <noreply@tara-delivery.cm>",
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("Email server is ready");
    return true;
  } catch (error) {
    console.error("Email server error:", error);
    return false;
  }
}
