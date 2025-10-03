import React, { Suspense } from "react";
import Image from "next/image";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";
import { getServicesBySlug } from "@/lib/api";
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
export const dynamic = "force-dynamic";

// Add generateMetadata function to handle dynamic params
export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = await Promise.resolve(params.id);
  const serviceData = await getServicesBySlug(id);

  if (!serviceData) {
    return {
      title: "Service Not Found",
      description: "The requested service could not be found.",
    };
  }

  return {
    title: serviceData.seo?.metaTitle || serviceData.title,
    description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
    keywords: serviceData.seo?.metaKeywords,
  };
}
async function getServiceData(id: string) {
  const response = await getServicesBySlug(id);
  return response;
}

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  console.log('location',window.location.href)

  const { id } = await params;

  const [serviceData] = await Promise.all([getServiceData(id)]);

  if (!serviceData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold">
          Project not found. Please check the URL.
        </h1>
      </div>
    );
  }
  const howItWorkBlock = serviceData.content.find(
    (block: { blockType: string }) => block.blockType === "workflow"
  );
  const statisticBlock = serviceData.content.find(
    (block: { blockType: string }) => block.blockType === "statistic"
  );

  // Find ManyImagesBlock with isTopPosition = true
  const topManyImagesBlock = serviceData.content.find(
    (block: { blockType: string; isTopPosition: boolean }) =>
      block.blockType === "manyImages" && block.isTopPosition === true
  );
  return (
    <div className="overflow-hidden">
      <section className="relative bg-gray-50 py-6 md:py-12">
        <Image
          src={serviceData.heroImage.url}
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          quality={75}
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAMYAAAAAAIAAABtbnRyUkdCIFhZWiAH3AAIAA4AFgAyADdhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAFA4PEg8NFBIQEhcVFBgeMCEcGBgeMCMiJSIgIiAtMCosLC4yKiAtLzU2NzVfPTcyNDhBNUZBY2NjSE5hbmRwbf/bAEMBFRcXHhoeNBwcNHxEOER8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fP/AABEIABQAFAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAABf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKMABjP/2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1b3fd5] to-[#0b1b3f97] z-10" />

        <ProjectDetailsClient serviceData={serviceData} />
      </section>

      <Suspense fallback={<DetailPageLoader />}>
        {serviceData.benefits && <Benefits serviceData={serviceData} />}

        {/* Render ManyImagesBlock with isTopPosition = true before advantages */}
        {topManyImagesBlock && (
          <div className="bg-[#f5f7fa]">
            <ManyImagesBlock
              key={topManyImagesBlock.id}
              {...topManyImagesBlock}
              images={topManyImagesBlock.images}
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
        <ProjectContent content={serviceData?.content} serviceData={serviceData} />

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
