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

function buildUrl(path: string, params: Record<string, string | number | boolean> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

  const DEFAULT_FETCH_OPTIONS = {
  revalidate: 60,
  tags: ["cms"],
};
  
const STATIC_FETCH_OPTIONS = {
    revalidate: 3600,
  tags: ["cms", "cms-static"],
};

  async function cmsFetch<T = unknown>(url: string, options: typeof DEFAULT_FETCH_OPTIONS = DEFAULT_FETCH_OPTIONS): Promise<T | null> {
  try {
    const response = await fetch(url, { ...options } as RequestInit);
    if (!response.ok) {
      throw new Error(`CMS fetch failed [${response.status}]: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("CMS fetch error:", url, error);
    throw error;
  }
}
export async function fetchPage(slug: string): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": slug,
    "where[isHomePage][equals]": "false",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url);
  const pages = data?.docs || [];
  return pages.length > 0 ? pages[0] : null;
}

export async function fetchPrivacyPolicy(): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": "privacy-policy",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, STATIC_FETCH_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function fetchTermsOfUse(): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[slug][equals]": "terms",
    "where[status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url, STATIC_FETCH_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function fetchHomePage(): Promise<PageData | null> {
  const url = buildUrl("/pages", {
    "where[isHomePage][equals]": "true",
    "where[status.status][equals]": "published",
  });
  const data = await cmsFetch<{ docs: PageData[] }>(url);
  const pages = data?.docs || [];
  return pages.length > 0 ? pages[0] : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchHeader(): Promise<any> {
  const url = buildUrl("/header");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await cmsFetch<{ docs: any[] }>(url, STATIC_FETCH_OPTIONS);
  return data?.docs?.[0] ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchFooter(): Promise<any> {
  const url = buildUrl("/footer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await cmsFetch<{ docs: any[] }>(url, STATIC_FETCH_OPTIONS);
  return data?.docs?.[0] ?? null;
}

export async function getServices() {
  const url = buildUrl("/services", {
    "where[status][equals]": "published",
    limit: 0,
  });
  const data = await cmsFetch<{ docs: unknown[] }>(url);
  return data?.docs ?? null;
}

export async function getAllServices() {
  const url = buildUrl("/services", { limit: 0 });
  const data = await cmsFetch<{ docs: unknown[] }>(url);
  return data?.docs ?? null;
}

export async function getServicesBySlug(slug: string): Promise<ServiceData | null> {
  const url = buildUrl("/services", {
    "where[slug][equals]": slug,
  });
  const data = await cmsFetch<{ docs: ServiceData[] }>(url);
  return data?.docs?.[0] ?? null;
}

export async function fetchLandingVariant(slug: string, variant: string): Promise<ServiceData | null> {
  const url = buildUrl("/services", {
    "where[slug][equals]": slug,
    "where[variant][equals]": variant,
  });
  const data = await cmsFetch<{ docs: ServiceData[] }>(url);
  return data?.docs?.[0] ?? null;
}

export async function getAllExperiments() {
  const url = buildUrl("/experiments", { limit: 0 });
  const data = await cmsFetch<{ docs: unknown[] }>(url);
  return data?.docs ?? null;
}
