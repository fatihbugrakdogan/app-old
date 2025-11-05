// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const response = new NextResponse("Logged out", { status: 200 });
  
  const isProduction = process.env.NODE_ENV === "production";
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  
  // Railway'de domain ayarı yapmıyoruz (default domain kullanılır)
  const cookieDomain = isRailway ? undefined : (isProduction ? ".workino.co" : "localhost");
  
  // Clear the auth-token cookie with the same settings as login
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: Boolean(isProduction || isRailway),
    sameSite: (isProduction || isRailway) ? "none" : "lax",
    path: "/",
    ...(cookieDomain && { domain: cookieDomain }),
    expires: new Date(0), // Expire immediately
    maxAge: 0, // Also set maxAge to 0
  });
  
  return response;
}
