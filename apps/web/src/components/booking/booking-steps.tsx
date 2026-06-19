import { cn } from "@repo/ui/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: "select", label: "Select seats" },
  { id: "hold", label: "Hold seats" },
  { id: "confirm", label: "Confirm" },
] as const;

type BookingStepId = (typeof STEPS)[number]["id"];

interface BookingStepsProps {
  current: BookingStepId;
}

export function BookingSteps({ current }: BookingStepsProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === current;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-primary/15 text-primary ring-4 ring-primary/20",
                  !isComplete &&
                    !isCurrent &&
                    "border-border bg-muted text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <span className="tabular-nums">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "hidden text-center text-xs sm:block",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
