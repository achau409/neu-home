import React, { Suspense } from "react";
import Image from "next/image";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";
import { fetchHeader, getServicesBySlug } from "@/lib/api";
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
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    alternates: {
      canonical: `https://www.neuhomeservices.com/${id}`,
    },
    openGraph: {
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
      url: `https://www.neuhomeservices.com/${id}`,
      images: [
        { url: serviceData.heroImage.url },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
      images: [
        { url: serviceData.heroImage.url },
      ],
    },
    icons: {
      icon: "/favicon.ico",
    },
    manifest: "/manifest.json",
    apple: {
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const serviceData = await getServicesBySlug(id);
  const header = await fetchHeader() as any;

  if (!serviceData) {
    return (
      <main className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold">
          Project not found. Please check the URL.
        </h1>
      </main>
    );
  }

  const howItWorkBlock = serviceData.content.find(
    (block: { blockType: string }) => block.blockType === "workflow"
  );
  const statisticBlock = serviceData.content.find(
    (block: { blockType: string }) => block.blockType === "statistic"
  );
  const topManyImagesBlock = serviceData.content.find(
    (block) => block.blockType === "manyImages" && block.isTopPosition === true
  );

  return (
    <>
      <header className="bg-[#0b1b3f]">
        <div className="py-5 flex justify-center items-center">
          <div className="flex items-center justify-center">
            {
              serviceData.customerLogo?.url ? (
                <Image
                  src={serviceData.customerLogo?.url}
                  alt={`${serviceData.title} logo`}
                  width={142}
                  height={142}
                  sizes="142px"
                  priority
                  className="w-[142px] h-[65px] object-contain"
                />) : (
                <Link href="/">
                  <Image
                    src={header.headerLogo.url}
                    alt="NEU Home Services logo"
                    width={142}
                    height={142}
                    priority
                    sizes="142px"
                  />
                </Link>
              )
            }

          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        <section className="relative py-6 md:py-4">
          <Image
            src={serviceData.heroImage.url}
            alt={serviceData.title}
            fill
            className="object-cover"
            quality={75}
            priority
            placeholder="blur"
            sizes="100vw"
            fetchPriority="high"
            blurDataURL={HERO_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-[#0b1b3f]/50 z-10" />

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
      </main>
    </>
  );
}
