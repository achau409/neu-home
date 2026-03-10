import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import Projects from "@/components/Home/Projects/Projects";
import WorksSections from "@/components/Home/Works/Works";
import HTMLBlock from "@/components/blocks/HTMLBlock";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchHomePage, getServices } from "@/lib/api";
import type { ContentBlock } from "@/types/service";

export const revalidate = 60;

const HomePage = async () => {
  const [services, cmsData] = await Promise.all([
    getServices(),
    fetchHomePage(),
  ]);

  const content: ContentBlock[] = cmsData?.content ?? [];

  const heroBlock = content.find((block) => block.blockType === "hero");
  const howItWorkBlock = content.find((block) => block.blockType === "workflow");
  const statisticBlock = content.find((block) => block.blockType === "statistic");
  const htmlBlock = content.find((block) => block.blockType === "htmlblock");

  return (
    <div>
      {heroBlock && (
        <HeroSection
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          heroData={heroBlock as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          services={(services ?? []) as any}
        />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Projects services={(services ?? []) as any} />
      {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
      {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
      {htmlBlock && <HTMLBlock content={(htmlBlock as { html?: string }).html ?? ""} />}
      <ScrollToTop />
    </div>
  );
};

export default HomePage;
