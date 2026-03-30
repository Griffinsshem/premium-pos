import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.error || "Login failed" },
        { status: backendResponse.status }
      );
    }

    const response = NextResponse.json({
      message: "Login successful",
      access_token: data.access_token,
      user: data.user,
    });

    // Token cookie
    response.cookies.set("token", data.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    // Role cookie 
    response.cookies.set("role", data.user.role, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}