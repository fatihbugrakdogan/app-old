// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = new NextResponse("Logged out", { status: 200 });
  
  const isProduction = process.env.NODE_ENV === "production";
  
  // Clear the auth-token cookie with the same settings as login
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    domain: isProduction ? ".workino.co" : "localhost",
    expires: new Date(0), // Expire immediately
    maxAge: 0, // Also set maxAge to 0
  });
  
  return response;
}
