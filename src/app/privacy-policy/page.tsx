import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchPrivacyPolicy } from "@/lib/api";
import parse from "html-react-parser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Neu Home Services",
  description: "Read our privacy policy to understand how we handle your data.",
};

export const dynamic = "force-static";

export default async function Page() {
  const privacyPolicy = await fetchPrivacyPolicy();
  const content = privacyPolicy?.content[0].html || "";

  return (
    <>
      <div className="privacy-policy-content">
        {content ? parse(content) : <p>No privacy policy content available.</p>}
      </div>
      <ScrollToTop />
    </>
  );
}
