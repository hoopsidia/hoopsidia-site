import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Simple rate limiting: max 5 submissions per minute per IP
const rateLimit = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 5;

  const timestamps = rateLimit.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  rateLimit.set(ip, recent);

  if (recent.length >= max) return true;
  recent.push(now);
  return false;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Singleton transporter — reuse SMTP connection across requests
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const transporter =
  gmailUser && gmailPass
    ? nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailPass } })
    : null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { name, email, company, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (transporter) {
      await transporter.sendMail({
        from: `Hoopsidia Contact <${gmailUser}>`,
        to: "hoopsidia@gmail.com",
        replyTo: email,
        subject: `[Hoopsidia.com] ${subject}`,
        text: `Nom: ${name}\nEmail: ${email}\nSociété: ${company || "N/A"}\n\n${message}`,
        html: `
          <h2>Nouveau message depuis hoopsidia.com</h2>
          <p><strong>Nom:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Société:</strong> ${escapeHtml(company || "N/A")}</p>
          <p><strong>Objet:</strong> ${escapeHtml(subject)}</p>
          <hr/>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        `,
      });
    } else {
      console.log("Contact form submission (no GMAIL config):", { name, subject });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
