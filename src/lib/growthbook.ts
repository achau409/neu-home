import { GrowthBook, type FeatureDefinition } from "@growthbook/growthbook";

// Module-level cache — avoids a CDN round-trip on every middleware request.
// TTL: 60 s. On cold start the first request fetches fresh; subsequent requests
// within the same process/warm invocation reuse the cached features.
let featuresCache: { data: Record<string, FeatureDefinition>; expires: number } | null = null;

async function loadFeatures(): Promise<Record<string, FeatureDefinition>> {
  if (featuresCache && Date.now() < featuresCache.expires) {
    return featuresCache.data;
  }
  try {
    const res = await fetch(
      `https://cdn.growthbook.io/api/features/${process.env.NEXT_PUBLIC_GROWTHBOOK_KEY}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return featuresCache?.data ?? {};
    const { features } = await res.json();
    featuresCache = { data: features ?? {}, expires: Date.now() + 60_000 };
    return featuresCache.data;
  } catch {
    return featuresCache?.data ?? {};
  }
}

export async function getGrowthBookVariant(
  featureKey: string,
  visitorId: string,
  fallback = "lp1"
): Promise<string> {
  try {
    const features = await loadFeatures();
    const gb = new GrowthBook({ attributes: { id: visitorId }, features });
    return (gb.getFeatureValue(featureKey, fallback) as string) || fallback;
  } catch {
    return fallback;
  }
}
