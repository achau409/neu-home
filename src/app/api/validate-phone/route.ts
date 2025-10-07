import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    const apiRes = await fetch(
      `https://api.trestleiq.com/3.0/phone_intel?phone=${encodeURIComponent(
        phone
      )}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.TRESTLE_API_KEY || "",
          "Content-Type": "application/json",
        },
      }
    );

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("Trestle API error:", errorText);
      throw new Error(`Trestle API error: ${errorText}`);
    }

    const data = await apiRes.json();

    // Just return the Trestle response (expected JSON)
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error validating phone:", error);
    // Return fallback JSON with expected structure
    return NextResponse.json(
      {
        id: "Phone.mock-id",
        phone_number: "unknown",
        is_valid: false,
        activity_score: null,
        country_calling_code: null,
        country_code: null,
        country_name: null,
        line_type: null,
        carrier: null,
        is_prepaid: null,
        add_ons: {},
        error: {
          name: "InternalError",
          message: error?.message || "Could not retrieve entire response",
        },
        warnings: "Missing Input",
      },
      { status: 500 }
    );
  }
}
