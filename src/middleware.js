import { NextResponse } from "next/server";

function getLandingSlugsFromEnv() {
  const raw = process.env.NEXT_PUBLIC_LANDING_SLUGS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
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
const LANDING_SLUGS = new Set(
  getLandingSlugsFromEnv().length ? getLandingSlugsFromEnv() : DEFAULT_SLUGS
);

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
  const slug = publicSlug(url.pathname);

  console.log("➡️ Incoming request:", url.pathname, "Slug detected:", slug);

  if (!LANDING_SLUGS.has(slug)) {
    console.log("⏭️ Slug not in LANDING_SLUGS, skipping middleware.");
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
