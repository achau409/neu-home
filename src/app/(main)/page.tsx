import { Suspense } from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import Projects from "@/components/Home/Projects/Projects";
import WorksSections from "@/components/Home/Works/Works";
import FAQSection from "@/components/Home/FAQ/FAQSection";
import HTMLBlock from "@/components/blocks/HTMLBlock";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchHomePage, getServices } from "@/lib/api";
import type { ContentBlock } from "@/types/service";

export const revalidate = 60;

const SITE_URL = "https://www.neuhomeservices.com";
const SITE_NAME = "NEU Home Services";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

type FaqSchemaItem = {
  question: string;
  answer: string;
};

const getFaqSchemaItems = (faqBlock?: ContentBlock): FaqSchemaItem[] => {
  const rawItems = (faqBlock as { items?: unknown[] } | undefined)?.items;
  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      const record = item as Record<string, unknown>;
      const question = typeof record.question === "string" ? record.question.trim() : "";
      const answer = typeof record.answer === "string" ? record.answer.trim() : "";

      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is FaqSchemaItem => Boolean(item));
};

export async function generateMetadata(): Promise<Metadata> {
  const homePageData = await fetchHomePage();

  const title = homePageData?.seo?.metaTitle || homePageData?.title || SITE_NAME;
  const description =
    homePageData?.seo?.metaDescription ||
    homePageData?.description ||
    "A Neu way for Home Improvement Projects";
  const keywords = homePageData?.seo?.metaKeywords;

  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: SITE_URL },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function HomePage() {
  const [services, cmsData] = await Promise.all([
    getServices(),
    fetchHomePage(),
  ]);

  const content: ContentBlock[] = cmsData?.content ?? [];

  const heroBlock = content.find((b) => b.blockType === "hero");
  const howItWorkBlock = content.find((b) => b.blockType === "workflow");
  const statisticBlock = content.find((b) => b.blockType === "statistic");
  const htmlBlock = content.find((b) => b.blockType === "htmlblock");
  const faqBlock = content.find((b) => b.blockType === "faq");
  const faqSchemaItems = getFaqSchemaItems(faqBlock);

  const serviceList = (services ?? []) as any;

  return (
    <>
      {/* JSON-LD structured data — boosts local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            name: "NEU Home Services",
            url: "https://www.neuhomeservices.com",
            logo: "https://www.neuhomeservices.com/images/logo.png",
            description: "A Neu way for Home Improvement Projects",
            areaServed: "US",
            sameAs: ["https://www.neuhomeservices.com"],
          }),
        }}
      />
      {faqSchemaItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqSchemaItems.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      )}

      <main>
        {/* Above fold — renders immediately, hero image has priority */}
        {heroBlock && (
          <HeroSection heroData={heroBlock as any} services={serviceList} />
        )}
        <Suspense>
          {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
        </Suspense>

        <Suspense>
          <Projects services={serviceList} />
        </Suspense>

        <Suspense>
          {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
        </Suspense>


        <Suspense>
          {htmlBlock && (
            <HTMLBlock content={(htmlBlock as { html?: string }).html ?? ""} />
          )}
        </Suspense>
        <Suspense>
          {faqBlock && (
            <FAQSection block={faqBlock} />
          )}
        </Suspense>


        <ScrollToTop />
      </main>
    </>
  );
}
