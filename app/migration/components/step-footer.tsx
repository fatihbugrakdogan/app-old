import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface StepFooterProps {
  onNext: () => void;
  onPrev: () => void;
  isLastStep?: boolean;
  isStarting?: boolean;
  disableNext?: boolean;
}

export function StepFooter({
  onNext,
  onPrev,
  isLastStep = false,
  isStarting = false,
  disableNext = false,
}: StepFooterProps) {
  return (
    <CardFooter className="flex justify-end gap-4 mt-6">
      <Button variant="outline" onClick={onPrev}>
        Previous
      </Button>
      <Button onClick={onNext} disabled={isStarting || disableNext}>
        {isLastStep ? (
          isStarting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Starting Migration...
            </>
          ) : (
            "Start Migration"
          )
        ) : (
          "Next"
        )}
      </Button>
    </CardFooter>
  );
}
