import React, { Suspense } from "react";
import Image from "next/image";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";
import { fetchLandingVariant, getServicesBySlug } from "@/lib/api";
import ProjectDetailsClient from "@/components/DetailsPage/ProjectDetailsClient";
import WorksSections from "@/components/Home/Works/Works";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import ProjectContent from "@/components/DetailsPage/ProjectContent";
import Inspirations from "@/components/DetailsPage/Inspirations/Inspirations";
import TestimonialsSlider from "@/components/DetailsPage/Reviews/Reviews";
import Features from "@/components/DetailsPage/Features/Features";
import Advantages from "@/components/DetailsPage/Advantages/Advantages";
import Benefits from "@/components/DetailsPage/Benefits/Benefits";
import ManyImagesBlock from "@/components/blocks/ManyImagesBlock";
import { HERO_BLUR_DATA_URL } from "@/lib/constants";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug } = await params;
  const serviceData = await getServicesBySlug(slug);

  if (!serviceData) {
    return {
      title: "Service Not Found",
      description: "The requested service could not be found.",
    };
  }

  return {
    title: serviceData.seo?.metaTitle || serviceData.title,
    description:
      serviceData.seo?.metaDescription || `Project Details - ${slug}`,
    keywords: serviceData.seo?.metaKeywords,
  };
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug, variant } = await params;

  let serviceData = await fetchLandingVariant(slug, variant);
  if (!serviceData && variant !== "lp1") {
    serviceData = await fetchLandingVariant(slug, "lp1");
  }
  if (!serviceData) {
    serviceData = await getServicesBySlug(slug);
  }

  if (!serviceData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold">
          Service not found. Please check the URL.
        </h1>
      </div>
    );
  }

  const howItWorkBlock = serviceData.content?.find(
    (block: { blockType: string }) => block.blockType === "workflow"
  );
  const statisticBlock = serviceData.content?.find(
    (block: { blockType: string }) => block.blockType === "statistic"
  );
  const topManyImagesBlock = serviceData.content?.find(
    (block) => block.blockType === "manyImages" && block.isTopPosition === true
  );

  return (
    <div className="overflow-hidden">
      <section className="relative bg-gray-50 py-6 md:py-12">
        <Image
          src={serviceData.heroImage.url}
          alt="Background Image"
          fill
          className="object-cover"
          quality={75}
          priority
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fd5] to-[#0b1b3f97] z-10" />

        <ProjectDetailsClient serviceData={serviceData} />
      </section>

      <Suspense fallback={<DetailPageLoader />}>
        {serviceData.benefits && <Benefits serviceData={serviceData} />}

        {topManyImagesBlock && (
          <div className="bg-[#f5f7fa]">
            <ManyImagesBlock
              key={topManyImagesBlock.id as string}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...(topManyImagesBlock as any)}
            />
          </div>
        )}

        {serviceData.advantages && (
          <Advantages
            advantageData={serviceData.advantages}
            title={serviceData.title}
          />
        )}

        {serviceData.features && (
          <Features featuresData={serviceData.features} />
        )}

        {serviceData.inspirationImages && (
          <Inspirations
            images={serviceData.inspirationImages.images}
            sectionTitle={serviceData.inspirationImages.sectionTitle}
          />
        )}

        {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}

        {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}
        <ProjectContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content={serviceData?.content as any}
          serviceData={serviceData}
        />

        {serviceData.testimonials && (
          <TestimonialsSlider
            testimonials={serviceData.testimonials.testimonialList}
            sectionTitle={serviceData.testimonials.sectionTitle}
          />
        )}
      </Suspense>
    </div>
  );
}
