import { cache } from "react";
import type { ServiceData, ContentBlock } from "@/types/service";

export interface PageData {
  title: string;
  slug: string;
  content: ContentBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const BASE_URL = process.env.PAYLOAD_URL;

function buildUrl(
  path: string,
  params: Record<string, string | number | boolean> = {}
): string | null {
  if (!BASE_URL) {
    console.error("PAYLOAD_URL environment variable is not set");
    return null;
  }
  try {
    const url = new URL(`${BASE_URL}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch {
    console.error("Failed to build CMS URL — invalid PAYLOAD_URL:", BASE_URL);
    return null;
  }
}

async function cmsFetch<T = unknown>(
  url: string | null,
  options: RequestInit = { next: { revalidate: 60, tags: ["cms"] } } as RequestInit
): Promise<T | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`CMS fetch failed [${res.status}]:`, url);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("CMS fetch error:", url, error);
    return null;
  }
}

const DEFAULT_OPTIONS: RequestInit = {
  next: { revalidate: 60, tags: ["cms"] },
} as RequestInit;

const STATIC_OPTIONS: RequestInit = {
  next: { revalidate: 3600, tags: ["cms", "cms-static"] },
} as RequestInit;

export async function fetchPage(slug: string): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": slug,
    "where[isHomePage][equals]": "false",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, DEFAULT_OPTIONS);
  const pages = data?.docs || [];
  return pages.length > 0 ? pages[0] : null;
}

export async function fetchPrivacyPolicy(): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": "privacy-policy",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, STATIC_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function fetchTermsOfUse(): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": "terms",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, STATIC_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export const fetchHomePage = cache(async (): Promise<PageData | null> => {
  const url = buildUrl("/pages", {
    "where[isHomePage][equals]": "true",
    "where[status.status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, DEFAULT_OPTIONS);
  const pages = data?.docs || [];
  return pages.length > 0 ? pages[0] : null;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchHeader(): Promise<any> {
  const url = buildUrl("/header");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await cmsFetch<{ docs: any[] }>(url, STATIC_OPTIONS);
  return data?.docs?.[0] ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchFooter(): Promise<any> {
  const url = buildUrl("/footer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await cmsFetch<{ docs: any[] }>(url, STATIC_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function getServices() {
  const url = buildUrl("/services", {
    "where[status][equals]": "published",
    limit: 0,
    depth: 1,
  });
  const data = await cmsFetch<{ docs: unknown[] }>(url, DEFAULT_OPTIONS);
  return data?.docs ?? null;
}

export async function getAllServices() {
  // depth=1 returns only direct relationships (icons, logos) without deeply
  // nesting all content blocks — keeps the response well under 2MB for caching
  const url = buildUrl("/services", {
    "where[status][equals]": "published",
    limit: 0,
    depth: 1,
  });
  const data = await cmsFetch<{ docs: unknown[] }>(url, DEFAULT_OPTIONS);
  return data?.docs ?? null;
}

export async function getServicesBySlug(slug: string): Promise<ServiceData | null> {
  const url = buildUrl("/services", {
    "where[slug][equals]": slug,
  });
  const data = await cmsFetch<{ docs: ServiceData[] }>(url, DEFAULT_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function fetchLandingVariant(
  slug: string,
  variant: string
): Promise<ServiceData | null> {
  const url = buildUrl("/services", {
    "where[slug][equals]": slug,
    "where[variant][equals]": variant,
  });
  const data = await cmsFetch<{ docs: ServiceData[] }>(url, DEFAULT_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function getAllExperiments() {
  const url = buildUrl("/experiments", { limit: 0 });
  const data = await cmsFetch<{ docs: unknown[] }>(url, DEFAULT_OPTIONS);
  return data?.docs ?? null;
}
