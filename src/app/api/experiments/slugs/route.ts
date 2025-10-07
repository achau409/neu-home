import { NextResponse } from "next/server";
import { getAllExperiments } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const experiments = (await getAllExperiments()) || [];
    const slugs = Array.from(
      new Set(
        experiments
          .map((e: any) => e?.slug)
          .filter((s: unknown): s is string => typeof s === "string" && !!s)
      )
    );

    const res = NextResponse.json({ slugs });
    res.headers.set(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=86400"
    );
    return res;
  } catch (_e) {
    // Return empty list to allow middleware fallback to defaults
    return NextResponse.json({ slugs: [] }, { status: 200 });
  }
}
