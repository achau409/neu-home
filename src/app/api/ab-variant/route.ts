import { getGrowthBookVariant } from "@/lib/growthbook";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const expKey = req.nextUrl.searchParams.get("experimentKey");
  const distinctId = req.nextUrl.searchParams.get("distinctId");

  if (!expKey || !distinctId) {
    return NextResponse.json({ error: "Missing experimentKey or distinctId" }, { status: 400 });
  }

  const variant = await getGrowthBookVariant(expKey, distinctId, "lp1");
  console.log("variant", variant);
  return NextResponse.json({ variant });
}
