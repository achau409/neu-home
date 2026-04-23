import React, { Suspense } from "react";
import Image from "next/image";
import { headers } from "next/headers";
import dynamic from "next/dynamic";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";
import { fetchHeader, getServicesBySlug } from "@/lib/api";
import ProjectDetailsClient from "@/components/DetailsPage/ProjectDetailsClient";
import WorksSections from "@/components/Home/Works/Works";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import ProjectContent from "@/components/DetailsPage/ProjectContent";
import Features from "@/components/DetailsPage/Features/Features";
import Advantages from "@/components/DetailsPage/Advantages/Advantages";
import Benefits from "@/components/DetailsPage/Benefits/Benefits";
import { HERO_BLUR_DATA_URL } from "@/lib/constants";
import Link from "next/link";
import TrustBadges from "@/components/DetailsPage/TrustBadges/TrustBadges";
import FAQSection from "@/components/Home/FAQ/FAQSection";
import { buildFaqPageJsonLd, processFaqItemsFromBlock } from "@/lib/faq";
import ManyImagesBlock from "@/components/blocks/ManyImagesBlock";

export const revalidate = 60;

const DeferredInspirations = dynamic(
  () => import("@/components/DetailsPage/Inspirations/Inspirations"),
  {
    loading: () => <div className="h-[320px] bg-gray-100 animate-pulse" />,
  }
);

const DeferredTestimonialsSlider = dynamic(
  () => import("@/components/DetailsPage/Reviews/Reviews"),
  {
    loading: () => <div className="h-[260px] bg-gray-100 animate-pulse" />,
  }
);

const getIpLocation = async (): Promise<{ city: string; state: string } | null> => {
  const forwarded = (await headers()).get("x-forwarded-for");
  const requestIp = forwarded ? forwarded.split(/,\s*/)[0] : null;
  const isLocalOrPrivateIp =
    !requestIp ||
    requestIp === "::1" ||
    requestIp === "127.0.0.1" ||
    requestIp.startsWith("10.") ||
    requestIp.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(requestIp);
  const ip = isLocalOrPrivateIp ? "8.8.8.8" : requestIp;
  const token = process.env.IPINFO_TOKEN;
  console.log("[getIpLocation] ip:", ip);

  if (!ip || !token) return null;

  try {
    const response = await fetch(`https://ipinfo.io/lite/${ip}?token=${token}`, {
      next: { revalidate: 3600 },
    });
    console.log("[getIpLocation] ipinfo status:", response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.log("[getIpLocation] ipinfo error response:", errorBody);
      return null;
    }

    const data = await response.json();
    console.log("[getIpLocation] ipinfo response:", data);
    return {
      city: typeof data?.city === "string" ? data.city : "",
      state: typeof data?.region === "string" ? data.region : "",
    };
  } catch {
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("[generateMetadata] id:", id);
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
  console.log("[ProjectDetails] id:", id);

  const [serviceData, header, ipLocation] = await Promise.all([
    getServicesBySlug(id),
    fetchHeader() as Promise<any>,
    getIpLocation(),
  ]);

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
  const trustBadgesBlock = serviceData.content.find(
    (block) => block.blockType === "trust-badges"
  );
  const faqBlock = serviceData.content.find(
    (block: { blockType: string }) => block.blockType === "faq"
  );
  const faqProcessedItems = processFaqItemsFromBlock(faqBlock ?? null);

  return (
    <>
      {faqProcessedItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildFaqPageJsonLd(faqProcessedItems)),
          }}
        />
      )}
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
                  quality={90}
                />) : (
                <Link href="/">
                  <Image
                    src={header.headerLogo.url}
                    alt="NEU Home Services logo"
                    width={142}
                    height={142}
                    sizes="142px"
                    priority
                    className="w-[142px] h-[65px] object-contain"
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
            quality={90}
            priority
            placeholder="blur"
            sizes="100vw"
            fetchPriority="high"
            blurDataURL={HERO_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-[#0b1b3f]/50 z-10" />

          <ProjectDetailsClient
            serviceData={serviceData}
            initialUserCity={ipLocation?.city || "Your Area"}
          />
        </section>
        {/* {topManyImagesBlock && (
          <div className="bg-[#f5f7fa]">
            <ManyImagesBlock
              key={topManyImagesBlock.id as string}
              {...(topManyImagesBlock as any)}
            />
          </div>
        )} */}

        {trustBadgesBlock && <TrustBadges {...(trustBadgesBlock as any)} />}

        <Suspense fallback={<DetailPageLoader />}>
          {serviceData.benefits && <Benefits serviceData={serviceData} />}

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
            <DeferredInspirations
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
            <DeferredTestimonialsSlider
              testimonials={serviceData.testimonials.testimonialList}
              sectionTitle={serviceData.testimonials.sectionTitle}
            />
          )}
          {faqBlock && (
            <FAQSection block={faqBlock} sectionId={`service-faq-${id}`} />
          )}
        </Suspense>
      </main>
    </>
  );
}
