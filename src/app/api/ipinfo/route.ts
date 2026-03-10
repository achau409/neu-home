import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(/, /)[0] : null;

  if (!ip) {
    return NextResponse.json(
      { city: "Unknown", state: "Unknown", country: "Unknown" },
      { status: 200 }
    );
  }

  const token = process.env.IPINFO_TOKEN;
  if (!token) {
    console.error("IPINFO_TOKEN env variable is not set");
    return NextResponse.json(
      { city: "Unknown", state: "Unknown", country: "Unknown" },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      next: { revalidate: 3600 },
    });

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
