"use client";

import React from "react";

export default function MigrateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl h-full mx-auto space-y-8 pt-20 pb-10 px-4">
      {children}
    </div>
  );
}
