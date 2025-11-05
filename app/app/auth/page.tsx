"use client";

import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { setCookie } from "cookies-next";

export default function AsanaAuthClient() {
  useEffect(() => {
    const state = uuid();

    // Store the state in a cookie
    setCookie("asanaAppAuthState", state, {
      maxAge: 3600, // 1 hour
      path: "/app/auth/asana",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("state", state);

    window.location.replace(
      `https://app.asana.com/-/oauth_authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ASANA_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URI}/app/auth/asana&state=${state}`
    );
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">You are connecting to Asana...</div>
    </div>
  );
}
