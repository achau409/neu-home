import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : null;

  if (!ip) {
    console.warn("No IP address found in request headers");
    return NextResponse.json(
      { city: "Unknown", state: "Unknown", country: "Unknown" },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(`http://ipinfo.io/${ip}?token=0a2e451facf1d6`);

    if (!response.ok) {
      console.error("IP info API error:", response.statusText);
      return NextResponse.json(
        { city: "Unknown", state: "Unknown", country: "Unknown" },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      city: data.city || "Unknown",
      state: data.region || "Unknown",
      country: data.country || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching IP info:", error);
    return NextResponse.json(
      { city: "Unknown", state: "Unknown", country: "Unknown" },
      { status: 200 }
    );
  }
}
