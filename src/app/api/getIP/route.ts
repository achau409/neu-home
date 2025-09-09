import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : null;

  return NextResponse.json({
    ip: ip,
  });
}
