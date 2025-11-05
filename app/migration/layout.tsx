"use client";

import React from "react";

export default function MigrateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl h-full mx-auto space-y-8 pt-20 pb-10">
      {children}
    </div>
  );
}
