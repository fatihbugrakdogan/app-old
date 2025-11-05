"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtomValue, useAtom } from "jotai";
import {
  sourceAccessTokenAtom,
  sourceProviderAtom,
  sourceWorkspaceAtom,
} from "../atom";
import { useAPI } from "@/hooks/use-api";
import { Loader2Icon } from "lucide-react";

type Workspace = {
  name: string;
  id: string;
};

export function SourceWorkspace() {
  const { loading, callAPI } = useAPI();
  const { accessToken, isSaved } = useAtomValue(sourceAccessTokenAtom);
  const sourceProvider = useAtomValue(sourceProviderAtom);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useAtom(sourceWorkspaceAtom);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const queryParams = new URLSearchParams({
          token: accessToken,
          source_provider: sourceProvider.id,
        });
        console.log("queryParams", queryParams);
        const response = await callAPI(
          `/migration-workspaces?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            requiresAuth: true,
          }
        );

        console.log("response", response);
        if (response && Array.isArray(response)) {
          setWorkspaces(response);
          if (response.length > 0 && !workspace) {
            setWorkspace(response[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    }

    if (accessToken && isSaved) {
      console.log("fetching workspaces");
      fetchWorkspaces();
    }
  }, [accessToken, isSaved, sourceProvider, callAPI, setWorkspace, workspace]);

  function handleWorkspaceChange(workspaceName: string) {
    const selectedWorkspace = workspaces.find((w) => w.name === workspaceName);
    if (selectedWorkspace) {
      setWorkspace(selectedWorkspace);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="workspace">Workspace</Label>
      <Select
        value={workspace?.name || ""}
        onValueChange={handleWorkspaceChange}
        disabled={loading || !accessToken || !isSaved}
      >
        <SelectTrigger id="workspace" className="w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading workspaces...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a workspace" />
          )}
        </SelectTrigger>
        <SelectContent>
          {workspaces.map(({ name, id }) => (
            <SelectItem key={id} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
