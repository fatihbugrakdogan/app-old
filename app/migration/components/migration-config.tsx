"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { runIdAtom, tenantAtom } from "../atom";

// Generate a random UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function MigrationConfig() {
  const [tenant, setTenant] = useAtom(tenantAtom);
  const [runId, setRunId] = useAtom(runIdAtom);

  // Auto-generate tenant UUID if not set
  useEffect(() => {
    if (!tenant) {
      setTenant(generateUUID());
    }
  }, [tenant, setTenant]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenant">
          Tenant <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="tenant"
            type="text"
            placeholder="Auto-generated UUID"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            required
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTenant(generateUUID())}
            title="Generate new UUID"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Required: Unique identifier for this migration tenant (auto-generated UUID)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="runId">Run ID (Optional)</Label>
        <Input
          id="runId"
          type="text"
          placeholder="Enter run ID (auto-generated if empty)"
          value={runId}
          onChange={(e) => setRunId(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Custom run identifier. If empty, will be auto-generated
        </p>
      </div>
    </div>
  );
}
