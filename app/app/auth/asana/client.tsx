"use client";

import { useEffect } from "react";

export function AsanaAuthClient() {
  useEffect(() => {
    // Perform any client-side actions needed after successful login
    // For example, update local state or redirect
    // router.push("/dashboard");
    window.opener.postMessage("success", "https://app.asana.com");
    window.close();
  }, []);

  return <div className="h-screen w-screen bg-white">Logging you in...</div>;
}
