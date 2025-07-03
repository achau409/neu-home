import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import Projects from "@/components/Home/Projects/Projects";
import WorksSections from "@/components/Home/Works/Works";
import HTMLBlock from "@/components/blocks/HTMLBlock";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchHomePage, getServices } from "@/lib/api";

// Add this export to force dynamic rendering
export const dynamic = "force-dynamic";

const HomePage = async () => {
  const services = await getServices();

  // Get CMS data
  const cmsData = await fetchHomePage();

  // Find specific blocks from CMS data
  const heroBlock = cmsData.content.find(
    (block: { blockType: string }) => block.blockType === "hero"
  );
  const howItWorkBlock = cmsData.content.find(
    (block: { blockType: string }) => block.blockType === "workflow"
  );
  const statisticBlock = cmsData.content.find(
    (block: { blockType: string }) => block.blockType === "statistic"
  );
  const htmlBlock = cmsData.content.find(
    (block: { blockType: string }) => block.blockType === "htmlblock"
  );

  return (
    <div>
      {/* Render sections only if their corresponding CMS data exists */}
      {heroBlock && <HeroSection heroData={heroBlock} services={services} />}
      {/* Projects section might be added to CMS later */}
      <Projects services={services} />
      {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
      {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
      {htmlBlock && <HTMLBlock content={htmlBlock.html} />}
      <ScrollToTop /> 
    </div>
  );
};

export default HomePage;
