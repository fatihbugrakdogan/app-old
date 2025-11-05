// app/api/auth/me/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // The user's browser will include the cookie automatically if we specify `credentials: "include"`.
    // But in a Route Handler, we need to pass cookies ourselves, or parse them from the request.
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie header received:", cookieHeader);
    
    if (!cookieHeader || !cookieHeader.includes("auth-token")) {
      console.log("No auth-token found in cookies");
      return new NextResponse("No auth token found in cookies or headers.", { status: 401 });
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify`,
      {
        headers: {
          Cookie: cookieHeader || "",
        },
      }
    );

    if (!response.ok) {
      return new NextResponse("Token invalid or missing", { status: 401 });
    }

    const userData = await response.json(); // e.g. { id: '123', msg: 'Token valid' }
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error("Me route error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
