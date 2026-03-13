import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import ContactForm from "@/components/ContactForm/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Neu Home Services",
  description: "Get in touch with us for any questions or concerns.",
  alternates: {
    canonical: "https://www.neuhomeservices.com/contact-us",
  },
  openGraph: {
    title: "Contact Us - Neu Home Services",
    description: "Get in touch with us for any questions or concerns.",
    url: "https://www.neuhomeservices.com/contact-us",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Neu Home Services",
    description: "Get in touch with us for any questions or concerns.",
  },
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <main>
      <section className="contact-us-content" aria-labelledby="contact-page-heading">
        <ContactForm />
      </section>
      <ScrollToTop />
    </main>
  );
}
