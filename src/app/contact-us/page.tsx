import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import ContactForm from "@/components/ContactForm/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Neu Home Services",
  description: "Get in touch with us for any questions or concerns.",
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <>
      <div className="contact-us-content">
        <ContactForm />
      </div>
      <ScrollToTop />
    </>
  );
}
