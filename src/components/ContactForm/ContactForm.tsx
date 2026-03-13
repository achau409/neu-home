"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <div className="flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-[#0b1b3f]/50 uppercase mb-2">
            Get in touch
          </p>
          <h1 id="contact-page-heading" className="text-4xl font-bold text-[#0b1b3f] leading-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-500 text-sm">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div>
              <Label htmlFor="name" className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Smith"
                {...register("name")}
                data-ph-no-capture
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={`mt-1.5 h-11 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0b1b3f] transition-colors placeholder:text-gray-300 ${errors.name ? "border-red-400 focus:border-red-400" : ""
                  }`}
              />
              {errors.name && (
                <p id="contact-name-error" className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                data-ph-no-capture
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={`mt-1.5 h-11 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0b1b3f] transition-colors placeholder:text-gray-300 ${errors.email ? "border-red-400 focus:border-red-400" : ""
                  }`}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="message" className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us how we can help you..."
                {...register("message")}
                data-ph-no-capture
                rows={5}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={`mt-1.5 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-[#0b1b3f] transition-colors placeholder:text-gray-300 resize-none ${errors.message ? "border-red-400 focus:border-red-400" : ""
                  }`}
              />
              {errors.message && (
                <p id="contact-message-error" className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.message.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#0b1b3f] hover:bg-[#162d63] text-white font-semibold tracking-wide transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </div>
      </div>

      <Dialog
        open={popup.show}
        onOpenChange={(open) => {
          if (!open) {
            setPopup({ show: false, success: false });
          }
        }}
      >
        <DialogContent className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center [&>button]:hidden">
          <DialogTitle className="sr-only">
            {popup.success ? "Message sent" : "Message failed"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {popup.success
              ? "Thank you for contacting us. We will get back to you soon."
              : "Something went wrong while sending your message. Please try again later."}
          </DialogDescription>
          {popup.success ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Message Sent!</h2>
              <p className="text-sm text-gray-500">
                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Failed to Send</h2>
              <p className="text-sm text-gray-500">
                Something went wrong. Please try again later.
              </p>
            </>
          )}
          <button
            onClick={() => setPopup({ show: false, success: false })}
            className="mt-6 w-full h-10 rounded-lg bg-[#0b1b3f] hover:bg-[#162d63] text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
