// app/components/LogoutButton.tsx
"use client";

import { useAuth } from "@/contexts/auth-context";

export default function LogoutButton() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      // No need to navigate here - logout function handles redirection
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return <button onClick={handleLogout}>Logout</button>;
}
