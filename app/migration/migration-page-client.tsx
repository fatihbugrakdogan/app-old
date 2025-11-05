// app/migrate/migrate-page-client.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Step, Steps } from "@/components/ui/stepper";
import { useAuth } from "@/contexts/auth-context";
import { MigrateProvider } from "@/contexts/migration-context";
import { useStepper } from "@/hooks/use-stepper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PlanningStep from "./planning";
import SourceStep from "./source";
import TargetStep from "./target";
import UserMappingStep from "./user-mapping";

const steps = [
  {
    label: "Source Asana",
    component: ({
      onNext,
      onPrev,
    }: {
      onNext: () => void;
      onPrev: () => void;
    }) => <SourceStep onNext={onNext} onPrev={onPrev} />,
  },
  {
    label: "Target Asana",
    component: ({
      onNext,
      onPrev,
    }: {
      onNext: () => void;
      onPrev: () => void;
    }) => <TargetStep onNext={onNext} onPrev={onPrev} />,
  },
  {
    label: "User Mapping",
    component: ({
      onNext,
      onPrev,
    }: {
      onNext: () => void;
      onPrev: () => void;
    }) => <UserMappingStep onNext={onNext} onPrev={onPrev} />,
  },
  {
    label: "Migration Planning",
    component: ({
      onNext,
      onPrev,
    }: {
      onNext: () => void;
      onPrev: () => void;
    }) => <PlanningStep onNext={onNext} onPrev={onPrev} />,
  },
];

export default function MigrationPageClient() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const [migrationData, setMigrationData] = useState({});
  const { nextStep, prevStep, activeStep } = useStepper({
    initialStep: 0,
    steps,
  });

  return (
    <div className="w-full max-w-3xl h-full mx-auto space-y-8">
      <div className="w-full flex flex-col">
        <Steps labelOrientation="vertical" activeStep={activeStep}>
          {steps.map(({ label }, index) => (
            <Step index={index} key={index} label={label} />
          ))}
        </Steps>
      </div>
      <MigrateProvider value={{ migrationData, setMigrationData }}>
        <Card className="w-full">
          {steps[activeStep].component({ onNext: nextStep, onPrev: prevStep })}
        </Card>
      </MigrateProvider>
    </div>
  );
}
