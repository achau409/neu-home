import { NextResponse } from "next/server";

const DEFAULT_SLUGS = [
  "ez-step-wit",
  "ez-step-wis",
  "mccann-exterior-doors",
  "mccann-siding",
  "mccann-windows",
  "schoenherr-roofing",
  "go-flooring",
  "123-wrep",
  "wis",
  "everdry-basement",
  "tranquility-wit",
  "tranquility-wis",
  "everdry-foundation-repair",
];
const DEFAULT_SLUGS_SET =  DEFAULT_SLUGS;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function publicSlug(pathname) {
  return pathname.split("/").filter(Boolean)[0] || "";
}

function expKeyFromSlug(slug) {
  return `exp__${slug}__v1`;
}

function getOrCreateVisitorId(req) {
  const cookieName = "ph_vid";
  const existing = req.cookies.get(cookieName)?.value;
  if (existing) {
    console.log("✅ Existing visitorId found:", existing);
    return existing;
  }
  const newId = crypto.randomUUID();
  console.log("🆕 Created new visitorId:", newId);
  return newId;
}

async function getVariantForSlug(slug, req, vid) {
  const experimentKey = expKeyFromSlug(slug);
  const controller = new AbortController();
  const timeoutMs = Number(process.env.NEXT_PUBLIC_AB_TIMEOUT_MS || 800);
  const t = setTimeout(() => {
    console.warn(
      `⏱️ Timeout reached (${timeoutMs}ms) for slug=${slug}, aborting fetch...`
    );
    controller.abort();
  }, timeoutMs);

  try {
    const origin = req.nextUrl.origin;
    const url = `${origin}/api/ab-variant?experimentKey=${experimentKey}&distinctId=${vid}`;
    console.log(`🌍 Fetching from: ${url}`);

    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    console.log(`📡 Fetch completed for slug=${slug}, status=${res.status}`);

    clearTimeout(t);

    if (!res.ok) throw new Error(`❌ Flag fetch failed: ${res.status}`);

    console.log("📥 Starting to parse JSON response...");
    const json = await res.json();
    console.log("✅ JSON parsed successfully:", json);

    const variant = json.variant;
    console.log("📦 Variant received:", variant);

    return variant === "control" ? "lp1" : variant;
  } catch (err) {
    clearTimeout(t);
    console.error("⚠️ Fetch error for slug:", slug, {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    });
    return "lp1";
  }
}

export default async function middleware(req) {
  const url = req.nextUrl;
  let slug = publicSlug(url.pathname);
  const host = url.hostname || req.headers.get("host") || "";

  // Host-based root mapping: serve /go-flooring at goflooroffers.com root while keeping URL clean
  if (
    !slug &&
    (host === "goflooroffers.com" || host === "www.goflooroffers.com")
  ) {
    console.log(
      "🌐 Host mapping active for:",
      host,
      "→ using slug: go-flooring"
    );
    slug = "go-flooring";
  }

  console.log("➡️ Incoming request:", url.pathname, "Slug detected:", slug);

  const landingSlugs = await loadLandingSlugs(req);
  if (!landingSlugs.has(slug)) {
    console.log("⏭️ Slug not in landingSlugs, skipping middleware.");
    return NextResponse.next();
  }

  const expKey = expKeyFromSlug(slug);
  const cookieName = `ab_${slug}`;
  const visitorId = getOrCreateVisitorId(req);

  let variant = req.cookies.get(cookieName)?.value || undefined;
  if (variant) {
    console.log("🍪 Found existing variant in cookie:", variant);
  } else {
    console.log("🔄 No variant cookie found, fetching variant...");
    variant = await getVariantForSlug(slug, req, visitorId);
    console.log("✅ Variant assigned:", variant);
  }

  const internal = url.clone();
  internal.pathname = `/version/${slug}/${variant}`;
  console.log("🔀 Rewriting to internal pathname:", internal.pathname);

  const res = NextResponse.rewrite(internal);

  res.cookies.set(cookieName, variant, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
  });
  console.log(`🍪 Set cookie ${cookieName}=${variant}`);

  res.cookies.set("ph_vid", visitorId, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: COOKIE_MAX_AGE,
  });
  console.log(`🍪 Set cookie ph_vid=${visitorId}`);

  res.headers.set("x-experiment-key", expKey);
  res.headers.set("x-variant", variant);
  res.headers.set("x-slug", slug);

  console.log("📤 Middleware response headers:", {
    "x-experiment-key": expKey,
    "x-variant": variant,
    "x-slug": slug,
  });

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

async function loadLandingSlugs(req) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.NEXT_PUBLIC_AB_TIMEOUT_MS || 800);
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const origin = req.nextUrl.origin;
    const url = `${origin}/api/experiments/slugs`;
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "force-cache",
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`bad status ${res.status}`);
    const data = await res.json();
    const slugs = Array.isArray(data?.slugs) ? data.slugs : [];
    return new Set(slugs);
  } catch (_e) {
    clearTimeout(t);
    return DEFAULT_SLUGS_SET;
  }
}
