import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tracking-[0.2em] text-gold uppercase">
          Etapa {current + 1} de {steps.length}
        </span>
        <span>{steps[current]}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-gold transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="hidden flex-wrap gap-1.5 md:flex">
        {steps.map((step, i) => (
          <button
            key={step}
            type="button"
            onClick={() => (i <= current ? onSelect(i) : undefined)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] transition-colors",
              i === current
                ? "bg-gold/15 text-gold"
                : i < current
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/50",
            )}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}