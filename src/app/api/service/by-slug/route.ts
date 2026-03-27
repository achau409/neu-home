import { NextResponse } from "next/server";
import { getServicesBySlug } from "@/lib/api";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug?.trim()) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const data = await getServicesBySlug(slug.trim());
  if (!data) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
