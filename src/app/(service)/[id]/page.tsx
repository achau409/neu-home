import { fetchHeader, getServicesBySlug, getIpLocation } from "@/lib/api";
import ServicePageContent from "@/components/DetailsPage/ServicePageContent";
import ServicePageContentNew from "@/components/DetailsPage/ServicePageContentNew";

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
    alternates: { canonical: `https://www.neuhomeservices.com/${id}` },
    openGraph: {
      title: serviceData.seo?.metaTitle || serviceData.title,
      description:
        serviceData.seo?.metaDescription || `Project Details - ${id}`,
      url: `https://www.neuhomeservices.com/${id}`,
      images: [{ url: serviceData.heroImage.url }],
    },
    twitter: {
      card: "summary_large_image",
      title: serviceData.seo?.metaTitle || serviceData.title,
      description:
        serviceData.seo?.metaDescription || `Project Details - ${id}`,
      images: [{ url: serviceData.heroImage.url }],
    },
    icons: { icon: "/favicon.ico" },
    manifest: "/manifest.json",
    robots: { index: true, follow: true },
  };
}

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [serviceData, header] = await Promise.all([
    getServicesBySlug(id),
    fetchHeader() as Promise<any>,
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

  const ipLocation = serviceData.hasLocation ? await getIpLocation() : null;
  const variant = serviceData.variant;

  return variant === "lp3" ? (
    <ServicePageContentNew
      serviceData={serviceData}
      header={header}
      ipLocation={ipLocation}
      slug={id}
      variant={variant}
    />
  ) : (
    <ServicePageContent
      serviceData={serviceData}
      header={header}
      ipLocation={ipLocation}
      slug={id}
      variant={variant}
    />
  );
}
