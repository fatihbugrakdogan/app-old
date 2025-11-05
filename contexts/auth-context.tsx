"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Example user type
interface User {
  username: string;
  id?: number;
  // add more fields as needed
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Run a check on mount only
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(username: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important: attach cookie
      });

      console.log("response", response);
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      // After a successful login, we can re-check user info
      await checkAuth();
    } catch (error) {
      console.error(error);
      throw error; // to handle in UI
    }
  }

  async function logout() {
    // Clear user state immediately
    setUser(null);
    
    // Clear all stored data
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any specific items we know about
      localStorage.removeItem('userMappingState');
      localStorage.removeItem('migrationState');
      
      // Try to call logout API (but don't fail if it doesn't work)
      try {
        const response = await fetch("/api/auth/logout", {
          method: "GET",
          credentials: "include",
        });
        console.log("Logout API response:", response.status);
      } catch (error) {
        console.log("Logout API call failed, but continuing with local cleanup:", error);
      }
      
      // Clear any cookies by setting them to expire
      try {
        // Specifically clear the auth-token cookie with the same settings as login
        const isProduction = window.location.hostname.includes('workino.co');
        const domain = isProduction ? '.workino.co' : 'localhost';
        const secure = isProduction;
        const sameSite = isProduction ? 'none' : 'lax';
        
        // Clear auth-token cookie specifically
        document.cookie = `auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; secure=${secure}; samesite=${sameSite}`;
        
        // Also clear any other cookies
        document.cookie.split(";").forEach(function(c) { 
          const cookieName = c.split("=")[0].trim();
          if (cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
          }
        });
      } catch (error) {
        console.log("Cookie cleanup failed:", error);
      }
      
    } catch (error) {
      console.error("Error during logout cleanup:", error);
    } finally {
      // Force a complete page reload to clear any cached state
      // Use setTimeout to ensure all cleanup is done before redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }

  async function checkAuth() {
    // Prevent multiple simultaneous checks
    if (isChecking) return;
    
    setIsChecking(true);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        setUser(null);
      } else {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("checkAuth error:", error);
      setUser(null);
    } finally {
      setLoading(false);
      setIsChecking(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
