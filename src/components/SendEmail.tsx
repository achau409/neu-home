"use client";

import { useState } from "react";

export default function SendEmail() {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    setLoading(true);
    const res = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderEmail: "nigma0001@gmail.com",
        senderName: "Neumediagroup",
        subject: "Hello from Brevo test Email",
        message: "This is a test email!",
        recipientEmail: "omorfarukrony2@gmail.com",
      }),
    });

    if (res.ok) {
      setEmailSent(true);
    } else {
      console.error("Failed to send email");
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={sendEmail} disabled={loading}>
        {loading ? "Sending..." : "Send Test Email"}
      </button>
      {emailSent && <p>Email sent successfully!</p>}
    </div>
  );
}
