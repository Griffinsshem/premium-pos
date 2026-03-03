import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "5";

    const backendResponse = await fetch(
      `http://127.0.0.1:5000/products?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("Flask error:", data);

      return NextResponse.json(
        {
          error:
            data.msg ||
            data.error ||
            "Failed to fetch products from backend",
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}