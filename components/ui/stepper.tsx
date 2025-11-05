import * as React from "react";
import { Check, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Separator } from "./separator";

/********** Context **********/

interface StepsContextValue extends StepsProps {
  isClickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  isLabelVertical?: boolean;
  stepCount?: number;
}

const StepsContext = React.createContext<StepsContextValue>({
  activeStep: 0,
});

export const useStepperContext = () => React.useContext(StepsContext);

export const StepsProvider: React.FC<{
  value: StepsContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  const isError = value.state === "error";
  const isLoading = value.state === "loading";

  const isVertical = value.orientation === "vertical";
  const isLabelVertical =
    value.orientation !== "vertical" && value.labelOrientation === "vertical";

  return (
    <StepsContext.Provider
      value={{
        ...value,
        isError,
        isLoading,
        isVertical,
        isLabelVertical,
      }}
    >
      {children}
    </StepsContext.Provider>
  );
};

/********** Steps **********/

export interface StepsProps {
  activeStep: number;
  orientation?: "vertical" | "horizontal";
  state?: "loading" | "error";
  onClickStep?: (step: number) => void;
  successIcon?: React.ReactElement;
  errorIcon?: React.ReactElement;
  labelOrientation?: "vertical" | "horizontal";
  children?: React.ReactNode;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      activeStep = 0,
      state,
      orientation = "horizontal",
      onClickStep,
      children,
      errorIcon,
      successIcon,
      labelOrientation,
    },
    ref
  ) => {
    const childArr = React.Children.toArray(children);
    const stepCount = childArr.length;
    const isClickable = !!onClickStep;

    return (
      <StepsProvider
        value={{
          activeStep,
          orientation,
          state,
          onClickStep,
          isClickable,
          stepCount,
          errorIcon,
          successIcon,
          labelOrientation,
        }}
      >
        <div ref={ref}>
          <ol className="flex items-center w-full">
            {React.Children.map(children, (child, i) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(
                  child as React.ReactElement<StepProps>,
                  {
                    ...child.props,
                    index: i,
                    isCompletedStep: i < activeStep,
                    isCurrentStep: i === activeStep,
                    isLastStep: i === stepCount - 1,
                  }
                );
              }
              return null;
            })}
          </ol>
        </div>
      </StepsProvider>
    );
  }
);

Steps.displayName = "Steps";

/********** Step **********/

export interface StepConfig extends StepLabelProps {
  icon?: React.ReactElement;
  component?: React.ReactNode;
}

export interface StepProps
  extends React.HTMLAttributes<HTMLDivElement>,
    StepConfig {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
  index?: number;
}

export const Step = React.forwardRef<HTMLLIElement, StepProps>((props, ref) => {
  const {
    index,
    label,
    description,
    icon: CustomIcon,
    isCompletedStep,
    isCurrentStep,
    isLastStep,
    optional,
    optionalLabel,
  } = props;

  const {
    isError,
    isLoading,
    successIcon: CustomSuccessIcon,
    errorIcon: CustomErrorIcon,
    onClickStep,
    isClickable,
  } = useStepperContext();

  const hasVisited = isCurrentStep || isCompletedStep;

  const handleClick = () => {
    if (isClickable && onClickStep && typeof index === "number") {
      onClickStep(index);
    }
  };

  const Icon = React.useMemo(() => CustomIcon ?? null, [CustomIcon]);

  const Success = React.useMemo(
    () => CustomSuccessIcon ?? <Check className="h-6 w-6" />,
    [CustomSuccessIcon]
  );

  const Error = React.useMemo(
    () => CustomErrorIcon ?? <X className="h-6 w-6" />,
    [CustomErrorIcon]
  );

  const RenderIcon = React.useMemo(() => {
    if (isCompletedStep) return Success;
    if (isCurrentStep) {
      if (isError) return Error;
      if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;
    }
    if (Icon) return Icon;
    return ((index || 0) + 1).toString();
  }, [
    isCompletedStep,
    Success,
    isCurrentStep,
    Icon,
    index,
    isError,
    Error,
    isLoading,
  ]);

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center",
        isLastStep ? "flex-[0_0_auto]" : "flex-[1_0_auto]"
      )}
      onClick={handleClick}
      data-disabled={!hasVisited}
    >
      <div className="flex items-center">
        <span
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full text-lg font-semibold",
            isCurrentStep
              ? "bg-[#14162E] text-white"
              : "bg-white text-[#6B7280] border-[#E5E7EB] border-2"
          )}
        >
          {RenderIcon}
        </span>
        <div className="ml-3">
          <span
            className={cn(
              "text-base",
              isCurrentStep ? "text-[#14162E] font-semibold" : "text-[#6B7280]"
            )}
          >
            {label}
            {optional && optionalLabel && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({optionalLabel})
              </span>
            )}
          </span>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {!isLastStep && (
        <div className="w-full flex-1 h-0.5 mx-4 bg-[#E5E7EB]"></div>
      )}
    </li>
  );
});

Step.displayName = "Step";
/********** StepLabel **********/

interface StepLabelProps {
  index?: number;
  label: string | React.ReactNode;
  description?: string | React.ReactNode;
  optional?: boolean;
  optionalLabel?: string | React.ReactNode;
}

const StepLabel = ({
  isCurrentStep,
  label,
  description,
  optional,
  optionalLabel,
}: StepLabelProps & {
  isCurrentStep?: boolean;
}) => {
  const { isLabelVertical } = useStepperContext();

  const shouldRender = !!label || !!description;

  const renderOptionalLabel = !!optional && !!optionalLabel;

  return shouldRender ? (
    <div
      aria-current={isCurrentStep ? "step" : undefined}
      className={cn(
        "flex w-max flex-col justify-center",
        isLabelVertical ? "items-center text-center" : "items-start text-left"
      )}
    >
      {!!label && (
        <p className="text-sm font-medium">
          {label}
          {renderOptionalLabel && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({optionalLabel})
            </span>
          )}
        </p>
      )}
      {!!description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  ) : null;
};

StepLabel.displayName = "StepLabel";

/********** Connector **********/

interface ConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  isCompletedStep: boolean;
  isLastStep?: boolean | null;
  hasLabel?: boolean;
  index: number;
}

const Connector = React.memo(
  ({ isCompletedStep, children, isLastStep }: ConnectorProps) => {
    const { isVertical } = useStepperContext();

    if (isVertical) {
      return (
        <div
          data-highlighted={isCompletedStep}
          className={cn(
            "ms-5 mt-1 flex h-auto min-h-[2rem] flex-1 self-stretch border-l-2 ps-8",
            isLastStep ? "min-h-0 border-transparent" : "",
            isCompletedStep ? "border-primary" : "border-muted"
          )}
        >
          {!isCompletedStep && (
            <div className="my-4 block h-auto w-full">{children}</div>
          )}
        </div>
      );
    }

    if (isLastStep) {
      return null;
    }

    return (
      <Separator
        data-highlighted={isCompletedStep}
        className="flex h-[2px] min-h-[auto] flex-1 self-auto data-[highlighted=true]:bg-primary"
        orientation={isVertical ? "vertical" : "horizontal"}
      />
    );
  }
);

Connector.displayName = "Connector";
