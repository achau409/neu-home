import { headers } from "next/headers";
import { fetchHeader, fetchLandingVariant, getServicesBySlug } from "@/lib/api";
import ServicePageContent from "@/components/DetailsPage/ServicePageContent";

export const revalidate = 60;

const getIpLocation = async (): Promise<{ city: string; state: string } | null> => {
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/,\s*/)[0] : null;
  const token = process.env.IPINFO_TOKEN;
  if (!ip || !token) return null;
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
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

  const [ipLocation, header, primaryVariant] = await Promise.all([
    getIpLocation(),
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

  return (
    <ServicePageContent
      serviceData={serviceData}
      header={header}
      ipLocation={ipLocation}
      slug={slug}
      variant={variant}
    />
  );
}
