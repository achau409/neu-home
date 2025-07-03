import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchTermsOfUse } from "@/lib/api";
import parse from "html-react-parser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Neu Home Services",
  description: "Read the terms and conditions for using Neu Home Services.",
};

export const dynamic = "force-static";

export default async function Page() {
  const termsOfUse = await fetchTermsOfUse();
  const content = termsOfUse?.content[0].html || "";

  return (
    <>
      <div className="terms-of-use-content">
        {content ? parse(content) : <p>No terms of use content available.</p>}
      </div>
      <ScrollToTop />
    </>
  );
}
