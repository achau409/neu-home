import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchPrivacyPolicy } from "@/lib/api";
import parse, { domToReact, Element, HTMLReactParserOptions } from "html-react-parser";

export const metadata = {
  title: "Privacy Policy - Neu Home Services",
  description: "Read our privacy policy to understand how we handle your data.",
  alternates: {
    canonical: "https://www.neuhomeservices.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy - Neu Home Services",
    description: "Read our privacy policy to understand how we handle your data.",
    url: "https://www.neuhomeservices.com/privacy-policy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Neu Home Services",
    description: "Read our privacy policy to understand how we handle your data.",
  },
};

export const dynamic = "force-static";

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.name === "h1") {
      return <h2>{domToReact(domNode.children as never[], parserOptions)}</h2>;
    }

    return undefined;
  },
};

export default async function Page() {
  const privacyPolicy = await fetchPrivacyPolicy();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: string = (privacyPolicy?.content?.[0] as any)?.html || "";

  return (
    <main className="privacy-policy-content">
      <article className="mx-auto max-w-4xl px-4 py-12 prose prose-slate">
        <h1>Privacy Policy</h1>
        {content ? parse(content, parserOptions) : <p>No privacy policy content available.</p>}
      </article>
      <ScrollToTop />
    </main>
  );
}
