"use client";

import { ChevronDownIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  processFaqItemsFromBlock,
  type FaqItemProcessed,
} from "@/lib/faq";

type FAQSectionProps = {
  /** CMS `faq` block (or any object with `items`). */
  block?: Record<string, unknown> | null;
  /** Optional `id` on the section for anchors / aria (default "faq"). */
  sectionId?: string;
};

function readBlockString(block: Record<string, unknown> | null | undefined, key: string): string {
  const v = block?.[key];
  return typeof v === "string" ? v : "";
}

function FaqAnswerContent({ item }: { item: FaqItemProcessed }) {
  const html = item.answerHtml;
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(html);

  if (looksLikeHtml) {
    return (
      <div
        className="faq-answer text-sm md:text-base text-gray-600 leading-relaxed [&_a]:text-[#0b1b3f] [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_p:first-child]:mt-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
      {html}
    </p>
  );
}

const FAQSection = ({ block, sectionId = "faq" }: FAQSectionProps) => {
  const reactId = useId();
  const items = useMemo(() => processFaqItemsFromBlock(block ?? null), [block]);

  const [openIndex, setOpenIndex] = useState<number>(0);

  const sectionTitle = readBlockString(block, "sectionTitle");
  const sectionSubtitle = readBlockString(block, "sectionSubtitle");
  const bg = readBlockString(block, "backgroundColor");
  const backgroundColor = bg || undefined;

  const headingId = `${sectionId}-heading`;

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id={sectionId}
      className="px-4 sm:px-6"
      style={backgroundColor ? { backgroundColor } : undefined}
      aria-labelledby={sectionTitle ? headingId : undefined}
    >
      <div className="mx-auto max-w-[980px]">
        <div className="text-center mb-8 md:mb-14">
          {sectionTitle && (
            <h2
              id={headingId}
              className="text-2xl md:text-[40px] font-bold tracking-tight text-[#0b1b3f] mb-3 uppercase"
            >
              {sectionTitle}
            </h2>
          )}
          {sectionSubtitle && (
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              {sectionSubtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${reactId}-panel-${index}`;
            const triggerId = `${reactId}-trigger-${index}`;

            return (
              <div
                key={`${item.question}-${index}`}
                className="rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <h3 className="text-base md:text-lg font-semibold text-[#0b1b3f] m-0">
                  <button
                    id={triggerId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full min-h-[48px] items-center justify-between gap-4 px-5 py-4 text-left touch-manipulation"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className="pr-2">{item.question}</span>
                    <span
                      className={`shrink-0 text-xl transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <ChevronDownIcon className="w-6 h-6" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="px-5 pb-5 pt-0"
                      aria-hidden={!isOpen}
                    >
                      <FaqAnswerContent item={item} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
