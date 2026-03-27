import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import ContactForm from "@/components/ContactForm/ContactForm";
import ContactEstimateLauncher from "@/components/ContactForm/ContactEstimateLauncher";
import { getServices } from "@/lib/api";
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

export const revalidate = 60;

export default async function Page() {
  const docs = (await getServices()) ?? [];
  const services = docs
    .map((d) => {
      const o = d as { slug?: string; title?: string };
      return {
        slug: typeof o.slug === "string" ? o.slug : "",
        title: typeof o.title === "string" ? o.title : "",
      };
    })
    .filter((s) => s.slug && s.title);

  return (
    <main>
      <section
        id="hero"
        className="contact-us-content"
        aria-labelledby="contact-page-heading"
      >
        <ContactForm />
      </section>
      <ContactEstimateLauncher services={services} />
      <ScrollToTop />
    </main>
  );
}
