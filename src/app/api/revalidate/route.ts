import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cache revalidation endpoint for CMS webhook or manual cache busting.
 *
 * Usage:
 *   GET /api/revalidate?secret=YOUR_SECRET              → revalidates all CMS cache
 *   GET /api/revalidate?secret=YOUR_SECRET&path=/       → revalidates a specific path
 *   GET /api/revalidate?secret=YOUR_SECRET&tag=cms      → revalidates a specific cache tag
 *
 * To test CMS UI changes immediately, hit this endpoint and the page will
 * re-fetch fresh data on the next request.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const path = req.nextUrl.searchParams.get("path");
  const tag = req.nextUrl.searchParams.get("tag");

  if (!process.env.CACHE_REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "CACHE_REVALIDATE_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (secret !== process.env.CACHE_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    // Default: bust all CMS caches
    revalidateTag("cms");
    return NextResponse.json({ revalidated: true, tag: "cms" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
