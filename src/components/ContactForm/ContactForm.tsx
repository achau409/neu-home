"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean; success: boolean }>({
    show: false,
    success: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const sendEmail = async (data: ContactFormValues) => {
    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: process.env.NEXT_PUBLIC_CONTACT_SENDER_EMAIL || "leads@neuhomeservices.com",
          senderName: "Neumediagroup",
          subject: "New Contact Form Message",
          message: `Dear Admin,\n\nA new contact form submission has been received:\n\nName: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
          recipientEmail: process.env.NEXT_PUBLIC_CONTACT_RECIPIENT_EMAIL || "info@neuhomeservices.com",
        }),
      });

      return res.ok;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    const success = await sendEmail(data);
    setLoading(false);

    if (success) {
      reset();
    }

    setPopup({ show: true, success });
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register("name")}
            data-ph-no-capture
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            data-ph-no-capture
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            {...register("message")}
            data-ph-no-capture
          />
          {errors.message && (
            <p className="text-red-500 text-sm">{errors.message.message}</p>
          )}
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
                    Your message has been successfully sent. We&apos;ll get back to
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
