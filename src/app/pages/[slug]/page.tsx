import ProjectContent from "@/components/DetailsPage/ProjectContent";
import HeroSection from "@/components/Home/Hero/HeroSection";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import WorksSections from "@/components/Home/Works/Works";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { fetchPage, getServices } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
    alternates: {
      canonical: `https://www.neuhomeservices.com/pages/${slug}`,
    },
    openGraph: {
      title: pageData.seo?.metaTitle || pageData.title,
      description: pageData.seo?.metaDescription || `Project Details - ${slug}`,
      url: `https://www.neuhomeservices.com/pages/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.seo?.metaTitle || pageData.title,
      description: pageData.seo?.metaDescription || `Project Details - ${slug}`,
    },
  };
}

const SlugPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const [services, cmsData] = await Promise.all([
    getServices(),
    fetchPage(slug),
  ]);

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
    <main>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {heroBlock && <HeroSection heroData={heroBlock as any} services={(services ?? []) as any} />}
      {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}
      {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProjectContent content={cmsData?.content as any} serviceData={cmsData} />
      <ScrollToTop />
    </main>
  );
};

export default SlugPage;
