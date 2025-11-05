// ./components/providers.js
"use client";

import { Provider } from "jotai";
import { AuthProvider } from "@/contexts/auth-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};
