"use client";

import { GrowthBook } from "@growthbook/growthbook";
import { GrowthBookProvider as GBProvider } from "@growthbook/growthbook-react";
import { useEffect, useRef, useState } from "react";

function getOrCreateVisitorId(): string {
  const cookieName = "gb_vid";
  const match = document.cookie.match(new RegExp("(^| )" + cookieName + "=([^;]+)"));
  if (match) return decodeURIComponent(match[2]);

  // Fall back to legacy ph_vid if it exists
  const legacy = document.cookie.match(new RegExp("(^| )ph_vid=([^;]+)"));
  const id = legacy ? decodeURIComponent(legacy[2]) : crypto.randomUUID();

  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${cookieName}=${id}; path=/; max-age=${maxAge}; samesite=lax`;
  return id;
}

export function GrowthBookProvider({ children }: { children: React.ReactNode }) {
  const gbRef = useRef<GrowthBook | null>(null);
  const [ready, setReady] = useState(false);

  if (!gbRef.current) {
    gbRef.current = new GrowthBook({
      apiHost: "https://cdn.growthbook.io",
      clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_KEY,
      enableDevMode: process.env.NODE_ENV !== "production",
    });
  }

  useEffect(() => {
    const gb = gbRef.current!;
    const visitorId = getOrCreateVisitorId();
    gb.setAttributes({ id: visitorId });
    gb.loadFeatures({ autoRefresh: true }).then(() => setReady(true));
    return () => gb.destroy();
  }, []);

  return (
    <GBProvider growthbook={gbRef.current}>
      {children}
    </GBProvider>
  );
}
