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

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `Hoopsidia Contact <${gmailUser}>`,
        to: "hoopsidia@gmail.com",
        replyTo: email,
        subject: `[Hoopsidia.com] ${subject}`,
        text: `Nom: ${name}\nEmail: ${email}\nSociété: ${company || "N/A"}\n\n${message}`,
        html: `
          <h2>Nouveau message depuis hoopsidia.com</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Société:</strong> ${company || "N/A"}</p>
          <p><strong>Objet:</strong> ${subject}</p>
          <hr/>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      });
    } else {
      // Log to console in development
      console.log("Contact form submission (no GMAIL config):", {
        name,
        email,
        company,
        subject,
        message,
      });
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
