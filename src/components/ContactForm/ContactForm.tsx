"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; success: boolean }>({
    show: false,
    success: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await sendEmail();
    setLoading(false);

    if (success) {
      setFormData({ name: "", email: "", message: "" });
    }

    setPopup({ show: true, success });
  };

  const sendEmail = async () => {
    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: "nigma0001@gmail.com",
          senderName: "Neumediagroup",
          subject: "New Contact Form Message",
          message: `
Dear Admin,

A new contact form submission has been received with the following details:

Contact Information:

Name: ${formData.name}
Email: ${formData.email}

Message Content:

${formData.message}

`,
          recipientEmail: "achau409@mtroyal.ca",
        }),
      });

      return res.ok;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            data-ph-no-capture
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-ph-no-capture
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            data-ph-no-capture
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>

      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              {popup.success ? (
                <>
                  <div className="mb-4 text-[#28a745]">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Thank You!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your message has been successfully sent. We'll get back to
                    you as soon as possible.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 text-red-500">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Message Not Sent
                  </h2>
                  <p className="text-gray-600 mb-4">
                    There was an error sending your message. Please try again
                    later.
                  </p>
                </>
              )}
              <Button
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={() => setPopup({ show: false, success: false })}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
