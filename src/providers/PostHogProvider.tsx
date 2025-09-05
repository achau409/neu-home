"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : undefined;
}
function expKeyFromPath(pathname: string) {
  const slug = pathname.split("/").filter(Boolean)[0] || "";
  return slug ? `exp__${slug}__v1` : null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        autocapture: true,
        persistence: "cookie",
        sanitize_properties: (properties) => {
          const scrubbed = { ...properties } as Record<string, unknown>;
          const piiKeys = [
            "name",
            "email",
            "phone",
            "message",
            "first_name",
            "last_name",
          ];
          for (const k of piiKeys)
            if (k in scrubbed) delete (scrubbed as any)[k];
          return scrubbed;
        },
      });
    }
    const phVid = getCookie("ph_vid");
    if (phVid) posthog.identify(phVid);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const slug = pathname.split("/").filter(Boolean)[0] || "";
    const expKey = expKeyFromPath(pathname);
    const variant = slug ? getCookie(`ab_${slug}`) : undefined;

    const search = searchParams?.toString() ? `?${searchParams}` : "";
    const utms = (() => {
      const p = new URLSearchParams(search);
      const u: Record<string, string> = {};
      for (const [k, v] of p.entries()) if (k.startsWith("utm_")) u[k] = v;
      return u;
    })();
    const inferred = (() => {
      const p = new URLSearchParams(search);
      if (p.has("gclid"))
        return { utm_source: "google", utm_medium: "cpc" } as const;
      if (p.has("fbclid"))
        return { utm_source: "facebook", utm_medium: "paid_social" } as const;
      return {} as const;
    })();

    posthog.register_once({
      utm_first_source:
        (utms as any).utm_source || (inferred as any).utm_source,
      utm_first_medium:
        (utms as any).utm_medium || (inferred as any).utm_medium,
      utm_first_campaign: (utms as any).utm_campaign,
    });
    posthog.register({
      utm_source: (utms as any).utm_source || (inferred as any).utm_source,
      utm_medium: (utms as any).utm_medium || (inferred as any).utm_medium,
      utm_campaign: (utms as any).utm_campaign,
    });

    if (expKey && variant) {
      posthog.featureFlags.override({ [expKey]: variant });
    }

    (posthog as any).capture(
      "page_view",
      {
        path: pathname,
        hostname:
          typeof window !== "undefined" ? window.location.hostname : undefined,
        experiment_key: expKey || undefined,
        variant,
      },
      { send_feature_flags: true }
    );
  }, [pathname, searchParams]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
