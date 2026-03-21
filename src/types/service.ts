import { Media } from "./hero";

export interface Service {
  title: string;
  slug: string;
  category?: "interior" | "exterior" | null;
  popular?: boolean;
  description: string;
  serviceIcon: Media;
  serviceImage: Media;
  benefits: unknown[];
  advantages: unknown[];
  customerLogo: Media;
  features: {
    description: string | null;
    images: unknown[];
    featureList: unknown[];
  };
  inspirationImages: unknown[];
  questions: null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ServiceData {
  id: string;
  title: string;
  slug: string;
  heroImage: { url: string };
  customerLogo?: { url: string };
  contactPhone?: string;
  serviceRequest: string;
  zipCodes: string;
  neuMediaText?: string;
  form_id?: string;
  CTAText?: string;
  heroSubHeading?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: ContentBlock[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  benefits?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advantages?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testimonials?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inspirationImages?: any;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

export interface ContentBlock {
  id?: string;
  blockType: string;
  blockName?: string | null;
  isTopPosition?: boolean;
  [key: string]: unknown;
}
