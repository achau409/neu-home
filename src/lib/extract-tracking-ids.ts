export interface TrackingIds {
  gtmId: string;
  metaPixelId: string;
  ga4Id: string;
}

export function extractTrackingIds(content: unknown): TrackingIds {
  const result: TrackingIds = { gtmId: "", metaPixelId: "", ga4Id: "" };
  if (!Array.isArray(content)) return result;

  for (const block of content) {
    if (
      !block ||
      typeof block !== "object" ||
      (block as { blockType?: string }).blockType !== "htmlblock" ||
      typeof (block as { html?: unknown }).html !== "string"
    ) {
      continue;
    }
    const html = (block as { html: string }).html;

    if (!result.gtmId) {
      const m = html.match(/GTM-[A-Z0-9]+/);
      if (m) result.gtmId = m[0];
    }
    if (!result.metaPixelId) {
      const m = html.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/);
      if (m) result.metaPixelId = m[1];
    }
    if (!result.ga4Id) {
      const m = html.match(/['"](G-[A-Z0-9]+)['"]/);
      if (m) result.ga4Id = m[1];
    }
  }

  return result;
}
