import PostHogClient from "@/lib/posthog";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const expKey = req.nextUrl.searchParams.get("experimentKey");
  const distinctId = req.nextUrl.searchParams.get("distinctId");

  if (!expKey || !distinctId) {
    return NextResponse.json(
      { error: "Missing experimentKey or distinctId" },
      { status: 400 },
    );
  }

  try {

    const variant = await PostHogClient().getFeatureFlag(expKey, distinctId);

    console.log("variant", variant);
    return NextResponse.json({ variant });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "flag error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
