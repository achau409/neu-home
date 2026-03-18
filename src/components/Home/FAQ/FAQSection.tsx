"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  block?: unknown;
  items?: FaqItem[];
};






const FAQSection = ({ block }: any) => {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const dynamicItems = block?.items ?? [];
  const faqItems = dynamicItems.length ? dynamicItems : [];
  const sectionTitle = block?.sectionTitle ?? "";
  const sectionSubtitle = block?.sectionSubtitle ?? "";
  const backgroundColor = block?.backgroundColor ?? "";

  return (
    <section
      className="py-14 px-4 sm:px-6"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="mx-auto max-w-[980px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#0b1b3f] mb-3 uppercase">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              {sectionSubtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {faqItems.map((item: any, index: number) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={`${item.question}-${index}`}
                className="rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-[#0b1b3f]">
                    {item.question}
                  </span>
                  <span
                    className={`text-xl  transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                    aria-hidden="true"
                  >
                    <ChevronDownIcon className="w-6 h-6 " />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm md:text-base text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
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
