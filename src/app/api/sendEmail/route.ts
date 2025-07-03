import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { senderEmail, senderName, subject, message, recipientEmail } =
      await req.json();

    // Validate required fields
    if (!senderEmail || !subject || !message || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "", // Secure API key
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName || "No Name" },
        subject,
        textContent: message,
        to: [{ email: recipientEmail, name: "Recipient" }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
