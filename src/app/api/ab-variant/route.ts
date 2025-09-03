import PostHogClient from "@/lib/posthog";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const expKey = req.nextUrl.searchParams.get("experimentKey");
  const distinctId = req.nextUrl.searchParams.get("distinctId");

  if (!expKey || !distinctId) {
    return NextResponse.json({ error: "Missing experimentKey or distinctId" }, { status: 400 });
  }

  try {
    const start = Date.now();

    const variant = await PostHogClient().getFeatureFlag(expKey, distinctId);

    console.log("🎯 PostHog getFeatureFlag latency:", Date.now() - start, "ms");

    // non-blocking fire-and-forget
    PostHogClient().capture({
      distinctId,
      event: "$feature_flag_called",
      properties: {
        $feature_flag: expKey,
        $feature_flag_response: variant as string | null,
      },
    });

    return NextResponse.json({ variant });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "flag error" }, { status: 500 });
  }
}
