"use client";

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SourceProviders } from "./components/source-providers";
import { AccessTokenInput } from "./components/source-token";
import { SourceWorkspace } from "./components/source-workspaces";
import { StepFooter } from "./components/step-footer";

export default function SourceStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>Source Configuration</CardTitle>
        <CardDescription>
          Configure your Asana source workspace and access token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SourceProviders />
        <AccessTokenInput />
        <SourceWorkspace />
      </CardContent>
      <StepFooter onNext={onNext} onPrev={onPrev} disableNext={false} />
    </>
  );
}
