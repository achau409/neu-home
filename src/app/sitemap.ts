import type { MetadataRoute } from "next";
import { getAllPages, getAllServices } from "@/lib/api";

const getSiteUrl = () => {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://www.neuhomeservices.com";

  const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  return normalizedUrl.replace(/\/$/, "");
};

type ServiceEntry = {
  slug?: string;
  variant?: string;
  updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [pages, services] = await Promise.all([
    getAllPages(),
    getAllServices(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/contact-us`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const pageRoutes: MetadataRoute.Sitemap = (pages ?? [])
    .filter((page) => page.slug && page.slug !== "contact-us" && page.slug !== "privacy-policy" && page.slug !== "terms")
    .map((page) => ({
      url: `${siteUrl}/pages/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const serviceRoutes: MetadataRoute.Sitemap = ((services ?? []) as ServiceEntry[])
    .filter((service) => service.slug)
    .map((service) => ({
      url: service.variant
        ? `${siteUrl}/version/${service.slug}/${service.variant}`
        : `${siteUrl}/${service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: service.variant ? 0.7 : 0.9,
    }));

  return [...staticRoutes, ...pageRoutes, ...serviceRoutes];
}
