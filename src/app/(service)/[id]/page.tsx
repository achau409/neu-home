import { headers } from "next/headers";
import { fetchHeader, getServicesBySlug } from "@/lib/api";
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serviceData = await getServicesBySlug(id);
  if (!serviceData) {
    return { title: "Service Not Found", description: "The requested service could not be found." };
  }
  return {
    title: serviceData.seo?.metaTitle || serviceData.title,
    description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
    keywords: serviceData.seo?.metaKeywords,
    alternates: { canonical: `https://www.neuhomeservices.com/${id}` },
    openGraph: {
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
      url: `https://www.neuhomeservices.com/${id}`,
      images: [{ url: serviceData.heroImage.url }],
    },
    twitter: {
      card: "summary_large_image",
      title: serviceData.seo?.metaTitle || serviceData.title,
      description: serviceData.seo?.metaDescription || `Project Details - ${id}`,
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

  const [serviceData, header, ipLocation] = await Promise.all([
    getServicesBySlug(id),
    fetchHeader() as Promise<any>,
    getIpLocation(),
  ]);

  if (!serviceData) {
    return (
      <main className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
        <h1 className="text-2xl font-bold">Project not found. Please check the URL.</h1>
      </main>
    );
  }

  return (
    <ServicePageContent
      serviceData={serviceData}
      header={header}
      ipLocation={ipLocation}
      slug={id}
    />
  );
}
