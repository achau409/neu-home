import { fetchHeader, fetchLandingVariant, getServicesBySlug, getIpLocation } from "@/lib/api";
// import ServicePageContent from "@/components/DetailsPage/ServicePageContent";
import ServicePageContentNew from "@/components/DetailsPage/ServicePageContentNew";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug, variant } = await params;
  const serviceData = await getServicesBySlug(slug);
  if (!serviceData) {
    return { title: "Service Not Found", description: "The requested service could not be found." };
  }
  const canonicalUrl = `https://www.neuhomeservices.com/${slug}`;
  return {
    title: serviceData.seo?.metaTitle || serviceData.title,
    description: serviceData.seo?.metaDescription || `Project Details - ${slug}`,
    keywords: serviceData.seo?.metaKeywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${slug}`,
      url: canonicalUrl,
      images: [{ url: serviceData.heroImage.url }],
    },
    twitter: {
      card: "summary_large_image",
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${slug}`,
      images: [{ url: serviceData.heroImage.url }],
    },
    robots: { index: true, follow: true },
    other: { "x-landing-variant": variant },
  };
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug, variant } = await params;

  const [header, primaryVariant] = await Promise.all([
    fetchHeader() as Promise<any>,
    fetchLandingVariant(slug, variant),
  ]);

  // Fallback chain: requested variant → lp1 → base service
  let serviceData = primaryVariant;
  if (!serviceData && variant !== "lp1") {
    serviceData = await fetchLandingVariant(slug, "lp1");
  }
  if (!serviceData) {
    serviceData = await getServicesBySlug(slug);
  }

  if (!serviceData) {
    return (
      <main className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold">Service not found. Please check the URL.</h1>
      </main>
    );
  }

  const ipLocation = serviceData.hasLocation ? await getIpLocation() : null;

  return (
    <ServicePageContentNew
      serviceData={serviceData}
      header={header}
      ipLocation={ipLocation}
      slug={slug}
      variant={variant}
    />
  );
  // return (
  //   variant === "lp3" ? (
  //     <ServicePageContentNew ... />
  //   ) : (
  //     <ServicePageContent ... />
  //   )
  // )
}

