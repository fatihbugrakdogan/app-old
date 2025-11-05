"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MigrationHomePage() {
  const router = useRouter();
  const [isLoading] = useState(false);

  const handleNewMigration = async () => {
    router.push(`/migration`);
  };

  return (
    <div className="container mx-auto p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Migrations</h1>
        <Button onClick={handleNewMigration} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Creating..." : "Start a new migration"}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Button
          variant="outline"
          size="lg"
          onClick={handleNewMigration}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Creating..." : "Start a new migration"}
        </Button>
      </div>
    </div>
  );
}
