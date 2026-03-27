import React from "react";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchTermsOfUse } from "@/lib/api";
import parse, { domToReact, Element, HTMLReactParserOptions } from "html-react-parser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Neu Home Services",
  description: "Read the terms and conditions for using Neu Home Services.",
  alternates: {
    canonical: "https://www.neuhomeservices.com/terms",
  },
  openGraph: {
    title: "Terms of Use - Neu Home Services",
    description: "Read the terms and conditions for using Neu Home Services.",
    url: "https://www.neuhomeservices.com/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use - Neu Home Services",
    description: "Read the terms and conditions for using Neu Home Services.",
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
  const termsOfUse = await fetchTermsOfUse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: string = (termsOfUse?.content?.[0] as any)?.html || "";

  return (
    <main className="terms-of-use-content">
      <article className="mx-auto max-w-4xl px-4 py-12 prose prose-slate">
        <h1>Terms of Use</h1>
        {content ? parse(content, parserOptions) : <p>No terms of use content available.</p>}
      </article>
      <ScrollToTop />
    </main>
  );
}
