import React, { Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import DetailPageLoader from "@/components/DetailsPage/Dotloading";
import ProjectDetailsClient from "@/components/DetailsPage/ProjectDetailsClient";
import WorksSections from "@/components/Home/Works/Works";
import HomeOwnersHelped from "@/components/Home/HomeOwnersHelped/HomeOwnersHelped";
import ProjectContent from "@/components/DetailsPage/ProjectContent";
import Features from "@/components/DetailsPage/Features/Features";
import Advantages from "@/components/DetailsPage/Advantages/Advantages";
import Benefits from "@/components/DetailsPage/Benefits/Benefits";
import TrustBadges from "@/components/DetailsPage/TrustBadges/TrustBadges";
import FAQSection from "@/components/Home/FAQ/FAQSection";
import ManyImagesBlock from "@/components/blocks/ManyImagesBlock";
import { buildFaqPageJsonLd, processFaqItemsFromBlock } from "@/lib/faq";
import { HERO_BLUR_DATA_URL } from "@/lib/constants";

const DeferredInspirations = dynamic(
    () => import("@/components/DetailsPage/Inspirations/Inspirations"),
    { loading: () => <div className="h-[320px] bg-gray-100 animate-pulse" /> }
);

const DeferredTestimonialsSlider = dynamic(
    () => import("@/components/DetailsPage/Reviews/Reviews"),
    { loading: () => <div className="h-[260px] bg-gray-100 animate-pulse" /> }
);

interface ServicePageContentProps {
    serviceData: any;
    header: any;
    ipLocation: { city: string; state: string } | null;
    slug: string;
    /** lp1, lp2, etc. — undefined means base service page (no variant) */
    variant?: string;
}

export default function ServicePageContent({
    serviceData,
    header,
    ipLocation,
    slug,
    variant,
}: ServicePageContentProps) {
    const content = serviceData.content ?? [];

    const howItWorkBlock = content.find(
        (b: any) => b.blockType === "workflow"
    );
    const statisticBlock = content.find(
        (b: any) => b.blockType === "statistic"
    );
    const topManyImagesBlock = content.find(
        (b: any) => b.blockType === "manyImages" && b.isTopPosition === true
    );
    const trustBadgesBlock = content.find(
        (b: any) => b.blockType === "trust-badges"
    );
    const faqBlock = content.find(
        (b: any) => b.blockType === "faq"
    );

    const faqProcessedItems = processFaqItemsFromBlock(faqBlock ?? null);
    const faqSectionId = variant ? `faq-${slug}-${variant}` : `faq-${slug}`;

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
                    {serviceData.customerLogo?.url ? (
                        <Image
                            src={serviceData.customerLogo.url}
                            alt={`${serviceData.title} logo`}
                            width={142}
                            height={142}
                            sizes="142px"
                            priority
                            className="w-[142px] h-[65px] object-contain"
                            quality={90}
                        />
                    ) : (
                        <Link href="/">
                            <Image
                                src={header?.headerLogo?.url ?? "/images/logo_in.svg"}
                                alt="NEU Home Services logo"
                                width={142}
                                height={142}
                                sizes="142px"
                                priority
                                className="w-[142px] h-[65px] object-contain"
                            />
                        </Link>
                    )}
                </div>
            </header>
            <main className="overflow-hidden">
                <section className="relative">
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
                        variant={variant}
                    />
                </section>

                {/* Trust badges — use CMS block if present, else render defaults */}
                {trustBadgesBlock
                    ? <TrustBadges {...(trustBadgesBlock as any)} />
                    : <TrustBadges />}

                <Suspense fallback={<DetailPageLoader />}>
                    {/* {topManyImagesBlock && !trustBadgesBlock && (
                        <div className="bg-[#f5f7fa]">
                            <ManyImagesBlock
                                key={topManyImagesBlock.id as string}
                                {...(topManyImagesBlock as any)}
                            />
                        </div>
                    )} */}

                    {serviceData.benefits && <Benefits serviceData={serviceData} />}

                    {serviceData.advantages && (
                        <Advantages
                            advantageData={serviceData.advantages}
                            title={serviceData.title}
                        />
                    )}

                    {howItWorkBlock && <WorksSections howItWorkBlock={howItWorkBlock} />}

                    {serviceData.features && (
                        <Features featuresData={serviceData.features} />
                    )}

                    {serviceData.inspirationImages && (
                        <DeferredInspirations
                            images={serviceData.inspirationImages.images}
                            sectionTitle={serviceData.inspirationImages.sectionTitle}
                        />
                    )}

                    {statisticBlock && <HomeOwnersHelped statisticBlock={statisticBlock} />}

                    <ProjectContent
                        content={content}
                        serviceData={serviceData}
                    />
                    {/* <p>
                        {
                            serviceData.id
                        }
                    </p> */}

                    {serviceData.testimonials && (
                        <DeferredTestimonialsSlider
                            testimonials={serviceData.testimonials.testimonialList}
                            sectionTitle={serviceData.testimonials.sectionTitle}
                        />
                    )}

                    {faqBlock && (
                        <FAQSection block={faqBlock} sectionId={faqSectionId} />
                    )}
                </Suspense>
            </main>
        </>
    );
}