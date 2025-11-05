"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MigrateContextType {
  migrationData: any;
  setMigrationData: React.Dispatch<React.SetStateAction<any>>;
}

const MigrateContext = createContext<MigrateContextType | null>(null);

interface MigrateProviderProps {
  children: ReactNode;
  value: MigrateContextType;
}

export const MigrateProvider: React.FC<MigrateProviderProps> = ({
  children,
  value,
}) => {
  return (
    <MigrateContext.Provider value={value}>{children}</MigrateContext.Provider>
  );
};

export const useMigrateContext = (): MigrateContextType => {
  const context = useContext(MigrateContext);
  if (context === null) {
    throw new Error("useMigrateContext must be used within a MigrateProvider");
  }
  return context;
};
