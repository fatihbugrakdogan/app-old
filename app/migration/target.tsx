"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SourceProviders } from "./components/target-providers";
import { AccessTokenInput } from "./components/target-token";
import { SourceWorkspace } from "./components/target-workspaces";
import { StepFooter } from "./components/step-footer";

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
          Configure your project target and workspace
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
