/**
 * List of backend API endpoints that are allowed to be proxied.
 * Only requests to these endpoints will be forwarded through the proxy.
 */
export const PROTECTED_ENDPOINTS = [
  "/api/migrations",
  "/api/migration",
  "/api/providers",
  "/api/workspaces",
  "/api/projects",
  "/api/users",
  "/api/mappings",
  "/api/health",
  "/api/status",
];

