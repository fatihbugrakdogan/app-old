// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1) Forward credentials to FastAPI
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);

    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
      {
        method: "POST",
        body: form,
      }
    );

    if (!authResponse.ok) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const { access_token: accessToken } = await authResponse.json();

    if (!accessToken) {
      return new NextResponse("No token in response", { status: 500 });
    }

    // 2) Set the cookie
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    console.log("cookie are setting...");

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("auth-token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      domain: isProduction ? ".workino.co" : "localhost",
    });

    console.log("cookie are set");

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
