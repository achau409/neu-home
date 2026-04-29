import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

function debug(...args) {
  if (isDev) console.log(...args);
}

function getLandingSlugsFromEnv() {
  const raw = process.env.EXP_LANDING_SLUGS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_SLUGS = [
  "go-flooring",
];

const LANDING_SLUGS = new Set(
  getLandingSlugsFromEnv().length ? getLandingSlugsFromEnv() : DEFAULT_SLUGS
);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function publicSlug(pathname) {
  return pathname.split("/").filter(Boolean)[0] || "";
}

function expKeyFromSlug(slug) {
  return `exp_${slug}_v1`;
}

function getOrCreateVisitorId(req) {
  const cookieName = "ph_vid";
  return req.cookies.get(cookieName)?.value || crypto.randomUUID();
}

async function getVariantForSlug(slug, req, vid) {
  const experimentKey = expKeyFromSlug(slug);
  const controller = new AbortController();
  const timeoutMs = Number(process.env.NEXT_PUBLIC_AB_TIMEOUT_MS || 800);
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const origin = req.nextUrl.origin;
    const url = `${origin}/api/ab-variant?experimentKey=${experimentKey}&distinctId=${vid}`;
    debug("AB fetch:", url);

    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(t);

    if (!res.ok) throw new Error(`Flag fetch failed: ${res.status}`);

    const json = await res.json();
    const variant = json.variant;
    debug("AB variant:", variant);

    if (!variant || variant === "control") return "lp1";
    return variant;
  } catch (err) {
    clearTimeout(t);
    if (isDev) console.error("AB fetch error:", slug, err?.message);
    return "lp1";
  }
}

export default async function middleware(req) {
  const url = req.nextUrl;
  let slug = publicSlug(url.pathname);
  const host = url.hostname || req.headers.get("host") || "";

  if (
    !slug &&
    (host === "goflooroffers.com" || host === "www.goflooroffers.com")
  ) {
    slug = "go-flooring";
  }

  if (!LANDING_SLUGS.has(slug)) {
    return NextResponse.next();
  }

  const expKey = expKeyFromSlug(slug);
  const cookieName = `ab_${slug}`;
  const visitorId = getOrCreateVisitorId(req);

  let variant = req.cookies.get(cookieName)?.value || undefined;
  if (!variant) {
    variant = await getVariantForSlug(slug, req, visitorId);
  }

  const internal = url.clone();
  internal.pathname = `/version/${slug}/${variant}`;

  const res = NextResponse.rewrite(internal);

  res.cookies.set(cookieName, variant, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
  });

  res.cookies.set("ph_vid", visitorId, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
  });

  res.headers.set("x-experiment-key", expKey);
  res.headers.set("x-variant", variant);
  res.headers.set("x-slug", slug);

  return res;
}

export const config = {
  matcher: [
    /*
     * Skip middleware for sitemap / robots so crawlers get XML/text, not HTML from rewrites.
     * (See Next.js middleware matcher docs.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)",
  ],
};
