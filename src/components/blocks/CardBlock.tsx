"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Option {
  image: {
    url: string;
    alt?: string;
  };
  label: string;
  link?: {
    id: string;
    slug: string;
  };
}

interface Section {
  sectionTitle: string;
  options: Option[];
  showMoreButton: boolean;
}

interface CardBlockProps {
  id: string;
  title: string;
  sections: Section[];
  blockName?: string | null;
  backgroundColor?: string | null;
}

const CardBlock: React.FC<CardBlockProps> = ({
  id,
  title,
  sections,
  blockName,
  backgroundColor,
}) => {
  // State to track which sections have "Show More" expanded
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});

  // Toggle expanded state for a section
  const toggleExpand = (sectionIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  // Default number of items to show before "Show More"
  const DEFAULT_VISIBLE_ITEMS = 6;

  return (
    <section
      id={blockName || `block-${id}`}
      className="py-12"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Main title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold px-4 py-3 inline-block ">{title}</h2>
      </div>

      {/* Sections */}
      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections[sectionIndex];
        const displayOptions =
          section.showMoreButton && !isExpanded
            ? section.options.slice(0, DEFAULT_VISIBLE_ITEMS)
            : section.options;

        return (
          <div key={`section-${sectionIndex}`} className="mb-12">
            {/* Section title */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold  py-2 inline-block">
                {section.sectionTitle}
              </h3>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-12 ">
              {displayOptions.map((option, optionIndex) => (
                <div
                  key={`option-${sectionIndex}-${optionIndex}`}
                  className="flex flex-col items-center shadow-md rounded-lg p-2 border border-gray-200"
                >
                  {option.link ? (
                    <Link href={`/${option.link.slug}`} className="text-center">
                      <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 aspect-square relative">
                        <Image
                          src={option.image.url}
                          alt={option.image.alt || option.label}
                          className="object-cover w-[150px] h-[150px]"
                          width={500}
                          height={500}
                        />
                      </div>
                      <p className="text-sm font-medium">{option.label}</p>
                    </Link>
                  ) : (
                    <div className="text-center">
                      <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 aspect-square relative">
                        <Image
                          src={option.image.url}
                          alt={option.image.alt || option.label}
                          width={500}
                          height={500}
                          className="object-cover w-[150px] h-[150px]"
                        />
                      </div>
                      <p className="text-sm font-medium">{option.label}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show More button */}
            {section.showMoreButton &&
              section.options.length > DEFAULT_VISIBLE_ITEMS && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => toggleExpand(sectionIndex)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CardBlock;
