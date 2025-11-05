"use client";

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { StepFooter } from "./components/step-footer";
import { SourceProviders } from "./components/target-providers";
import { AccessTokenInput } from "./components/target-token";
import { SourceWorkspace } from "./components/target-workspaces";

export default function TargetStep({
  onNext,
  onPrev,
}: {
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle>Target Configuration</CardTitle>
        <CardDescription>
          Configure your Asana target workspace and access token
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
