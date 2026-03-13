import { Suspense } from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import Projects from "@/components/Home/Projects/Projects";
import WorksSections from "@/components/Home/Works/Works";
import HTMLBlock from "@/components/blocks/HTMLBlock";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchHomePage, getServices } from "@/lib/api";
import type { ContentBlock } from "@/types/service";

export const revalidate = 60;

const SITE_URL = "https://www.neuhomeservices.com";
const SITE_NAME = "NEU Home Services";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

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

      <main>
        {/* Above fold — renders immediately, hero image has priority */}
        {heroBlock && (
          <HeroSection heroData={heroBlock as any} services={serviceList} />
        )}

        {/* Below fold — wrapped in Suspense for streaming */}
        <Suspense>
          <Projects services={serviceList} />
        </Suspense>

        <Suspense>
          {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
        </Suspense>

        <Suspense>
          {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
        </Suspense>

        <Suspense>
          {htmlBlock && (
            <HTMLBlock content={(htmlBlock as { html?: string }).html ?? ""} />
          )}
        </Suspense>

        <ScrollToTop />
      </main>
    </>
  );
}
