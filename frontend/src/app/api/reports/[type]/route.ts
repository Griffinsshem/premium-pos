import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await context.params;

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    let backendUrl = "";

    if (type === "product") {
      backendUrl = "http://127.0.0.1:5000/reports/sales-by-product";
    } else if (type === "payment") {
      backendUrl =
        "http://127.0.0.1:5000/reports/sales-by-payment-method";
    } else if (type === "low-stock") {
      const threshold =
        req.nextUrl.searchParams.get("threshold") || "5";
      backendUrl = `http://127.0.0.1:5000/reports/low-stock?threshold=${threshold}`;
    } else {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}