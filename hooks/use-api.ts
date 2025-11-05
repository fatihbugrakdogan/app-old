import { useState, useCallback } from "react";

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  /**
   * Indicates whether this endpoint requires authentication
   * (e.g., needs an HTTP-only cookie with a token).
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
          requiresAuth = false,
        } = options;

        // Merge default & custom headers
        const finalHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...headers,
        };
        
        // Use the proxy route for authenticated requests, direct URL for others
        const apiUrl = requiresAuth 
          ? `/api/proxy${endpoint}` 
          : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`;
        
        const response = await fetch(apiUrl, {
          method,
          headers: {
            ...finalHeaders,
          },
          body: body ? JSON.stringify(body) : undefined,
          credentials: requiresAuth ? "include" : "omit", // Include cookies only when auth is required
        });

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
