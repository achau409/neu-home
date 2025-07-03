import ProjectContent from "@/components/DetailsPage/ProjectContent";
import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import WorksSections from "@/components/Home/Works/Works";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchPage, getServices, getServicesBySlug } from "@/lib/api";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Define props type for the page parameters
interface TestPageProps {
  params: {
    slug: string;
  };
}
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = await Promise.resolve(params.slug);
  const pageData = await fetchPage(slug);

  if (!pageData) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  return {
    title: pageData.seo?.metaTitle || pageData.title,
    description: pageData.seo?.metaDescription || `Project Details - ${slug}`,
    keywords: pageData.seo?.metaKeywords,
  };
}

const SlugPage = async ({ params }: TestPageProps) => {
  // Fetch data with caching strategy similar to home page
  const services = await getServices();

  // Get CMS data for this specific test page using the slug
  const cmsData = await fetchPage(params.slug);

  // Find specific blocks from CMS data
  const heroBlock = cmsData?.content.find(
    (block: { blockType: string }) => block.blockType === "hero"
  );
  const howItWorkBlock = cmsData?.content.find(
    (block: { blockType: string }) => block.blockType === "workflow"
  );
  const statisticBlock = cmsData?.content.find(
    (block: { blockType: string }) => block.blockType === "statistic"
  );

  return (
    <div>
      {/* Render sections only if their corresponding CMS data exists */}
      {heroBlock && (
        <HeroSection
          heroData={heroBlock}
          services={services}
        />
      )}
      {/* Projects section might be added to CMS later */}
      {/* <Projects services={services} /> */}
      {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
      {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
      <ProjectContent content={cmsData?.content} />
      <ScrollToTop />
    </div>
  );
};

export default SlugPage;
