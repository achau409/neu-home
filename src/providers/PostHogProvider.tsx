"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

let phInitialized = false;

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : undefined;
}

function expKeyFromPath(pathname: string) {
  const slug = pathname.split("/").filter(Boolean)[0] || "";
  return slug ? `exp_${slug}_v1` : null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!phInitialized) {
      phInitialized = true;
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        autocapture: true,
        persistence: "cookie",
        sanitize_properties: (properties) => {
          const scrubbed = { ...properties } as Record<string, unknown>;
          const piiKeys = ["name", "email", "phone", "message", "first_name", "last_name"];
          for (const k of piiKeys) if (k in scrubbed) delete (scrubbed as Record<string, unknown>)[k];
          return scrubbed;
        },
      });
    }
    const phVid = getCookie("ph_vid");
    if (phVid) posthog.identify(phVid);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    // Read search params after hydration — avoids useSearchParams / Suspense issues
    const search = typeof window !== "undefined" ? window.location.search : "";

    const slug = pathname.split("/").filter(Boolean)[0] || "";
    const expKey = expKeyFromPath(pathname);
    const variant = slug ? getCookie(`ab_${slug}`) : undefined;

    const utms = (() => {
      const p = new URLSearchParams(search);
      const u: Record<string, string> = {};
      for (const [k, v] of p.entries()) if (k.startsWith("utm_")) u[k] = v;
      return u;
    })();

    const inferred = (() => {
      const p = new URLSearchParams(search);
      if (p.has("gclid")) return { utm_source: "google", utm_medium: "cpc" } as const;
      if (p.has("fbclid")) return { utm_source: "facebook", utm_medium: "paid_social" } as const;
      return {} as const;
    })();

    posthog.register_once({
      utm_first_source: utms.utm_source || (inferred as Record<string, string>).utm_source,
      utm_first_medium: utms.utm_medium || (inferred as Record<string, string>).utm_medium,
      utm_first_campaign: utms.utm_campaign,
    });
    posthog.register({
      utm_source: utms.utm_source || (inferred as Record<string, string>).utm_source,
      utm_medium: utms.utm_medium || (inferred as Record<string, string>).utm_medium,
      utm_campaign: utms.utm_campaign,
    });

    if (expKey && variant) {
      posthog.featureFlags.overrideFeatureFlags({ flags: { [expKey]: variant } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (posthog as any).capture(
      "page_view",
      {
        path: pathname,
        hostname: typeof window !== "undefined" ? window.location.hostname : undefined,
        experiment_key: expKey || undefined,
        variant,
      },
      { send_feature_flags: true }
    );
  }, [pathname]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
