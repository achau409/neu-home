import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchPrivacyPolicy } from "@/lib/api";
import parse from "html-react-parser";

export const metadata = {
  title: "Privacy Policy - Neu Home Services",
  description: "Read our privacy policy to understand how we handle your data.",
};

export const dynamic = "force-static";

export default async function Page() {
  const privacyPolicy = await fetchPrivacyPolicy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: string = (privacyPolicy?.content?.[0] as any)?.html || "";

  return (
    <>
      <div className="privacy-policy-content">
        {content ? parse(content) : <p>No privacy policy content available.</p>}
      </div>
      <ScrollToTop />
    </>
  );
}
