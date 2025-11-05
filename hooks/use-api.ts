import { useCallback, useState } from "react";
import { PROTECTED_ENDPOINTS } from "@/constants/protected-endpoints";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  /**
   * Indicates whether this endpoint requires authentication
   * (e.g., needs an HTTP-only cookie with a token).
   * If not specified, will auto-detect based on endpoint.
   */
  requiresAuth?: boolean;
}

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callAPI = useCallback(
    async <T>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const {
          method = "GET",
          body,
          headers = {},
          requiresAuth,
        } = options;

        // Auto-detect if endpoint requires authentication
        const needsAuth = requiresAuth !== undefined 
          ? requiresAuth 
          : PROTECTED_ENDPOINTS.some(protectedEndpoint => 
              endpoint.startsWith(protectedEndpoint)
            );

        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_API_URL || "").replace(/\/$/, "");
        const shouldProxy = needsAuth;
        const targetUrl = shouldProxy
          ? `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
          : `${backendBase}${endpoint}`;

        // Merge default & custom headers
        const finalHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...headers,
        };
        
        const response = await fetch(
          targetUrl,
          {
            method,
            headers: {
              ...finalHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
            credentials: needsAuth ? "include" : "omit", // Include cookies when auth is needed
          }
        );

        if (!response.ok) {
          console.log(response);
          const errorData = await response.json();
          console.log("errorData", errorData);
          console.error("API Error:", errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as T;
      } catch (e) {
        setError(
          e instanceof Error ? e : new Error("An unknown error occurred")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { callAPI, loading, error };
};
