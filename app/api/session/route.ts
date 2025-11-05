// app/api/session/route.js
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// Call your FastAPI verify/endpoint that returns user info, e.g. { "username": "alice" }
const FASTAPI_VERIFY_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-token`;

export async function GET(request: NextRequest) {
  // 1) Read cookies from request
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parse(cookieHeader);
  const token = cookies["auth-token"];

  // 2) If no token, return 401
  if (!token) {
    return NextResponse.json(
      { message: "No token found", isAuthenticated: false },
      { status: 401 }
    );
  }

  // 3) Verify token by calling FastAPI
  const verifyResponse = await fetch(FASTAPI_VERIFY_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!verifyResponse.ok) {
    return NextResponse.json(
      { message: "Invalid or expired token", isAuthenticated: false },
      { status: 401 }
    );
  }

  // 4) FastAPI returns a JSON object like { "username": "alice", ... }
  const data = await verifyResponse.json();

  // 5) Return user info in NextResponse
  //    Best practice: ensure your FastAPI endpoint returns well-structured JSON
  return NextResponse.json({
    isAuthenticated: true,
    user: data.username, // or whatever field name FastAPI returns
  });
}
