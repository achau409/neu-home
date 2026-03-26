/**
 * Shared FAQ helpers: single source for visible FAQ markup and FAQPage JSON-LD (must match).
 * Allowed answer HTML aligns with Google FAQ rich-result guidance (subset of supported tags).
 */

export type FaqItemRaw = {
  question: string;
  answer: string;
};

export type FaqItemProcessed = {
  question: string;
  /** Sanitized HTML — use for both DOM and JSON-LD `acceptedAnswer.text`. */
  answerHtml: string;
};

/**
 * Extract FAQ rows from a CMS `faq` block (or inline items array).
 */
export function extractFaqItemsFromBlock(block: unknown): FaqItemRaw[] {
  const b = block as { items?: unknown[] } | null | undefined;
  const rawItems = Array.isArray(b?.items) ? b!.items : [];
  if (rawItems.length === 0) return [];

  return rawItems
    .map((item) => {
      const record = item as Record<string, unknown>;
      const question = typeof record.question === "string" ? record.question.trim() : "";
      const answer = typeof record.answer === "string" ? record.answer.trim() : "";
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is FaqItemRaw => Boolean(item));
}

/**
 * Whitelist: a, b, strong, em, p, ul, ol, li, br — plus safe https links on <a>.
 * Strips scripts, event handlers, and javascript: URLs.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sanitizeFaqAnswerHtml(raw: string): string {
  if (!raw?.trim()) return "";

  const cleaned = raw
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");

  const out = cleaned.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const t = tag.toLowerCase();
    const closing = full.startsWith("</");

    if (t === "br" && !closing) return "<br />";

    if (["b", "strong", "ul", "ol", "li", "p", "em"].includes(t)) {
      return closing ? `</${t}>` : `<${t}>`;
    }

    if (t === "a") {
      if (closing) return "</a>";
      const hrefMatch = /\bhref\s*=\s*["']([^"']+)["']/i.exec(attrs);
      const href = hrefMatch?.[1]?.trim();
      if (!href || !/^https?:\/\//i.test(href)) return "";
      const escaped = href.replace(/"/g, "&quot;");
      return `<a href="${escaped}" rel="noopener noreferrer" target="_blank">`;
    }

    return "";
  });

  return out.trim();
}

export function processFaqItemsFromBlock(block: unknown): FaqItemProcessed[] {
  return extractFaqItemsFromBlock(block)
    .map(({ question, answer }) => {
      let answerHtml = sanitizeFaqAnswerHtml(answer);
      if (!answerHtml && answer.trim()) {
        answerHtml = escapeHtml(answer.trim());
      }
      return { question, answerHtml };
    })
    .filter((item) => item.question.length > 0 && item.answerHtml.length > 0);
}

export function buildFaqPageJsonLd(items: FaqItemProcessed[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerHtml,
      },
    })),
  };
}
