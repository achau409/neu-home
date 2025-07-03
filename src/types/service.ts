import { Media } from "./hero";

export interface Service {
  title: string;
  slug: string;
  description: string;
  serviceIcon: Media;
  serviceImage: Media;
  benefits: any[];
  advantages: any[];
  customerLogo: Media;
  features: {
    description: string | null;
    images: any[];
    featureList: any[];
  };
  inspirationImages: any[];
  questions: null;
}
