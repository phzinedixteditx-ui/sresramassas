import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function OptionCard({
  title,
  description,
  emoji,
  price,
  selected,
  disabled,
  onClick,
  compact,
  badge,
}: {
  title: string;
  description?: string;
  emoji?: string;
  price?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  compact?: boolean;
  badge?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200",
        "bg-secondary/40 hover:border-gold/50 hover:bg-secondary/70 active:scale-[0.99]",
        selected
          ? "border-gold bg-gold/10 shadow-gold"
          : "border-border",
        disabled && !selected && "cursor-not-allowed opacity-40 hover:border-border hover:bg-secondary/40",
        compact && "items-center gap-2 p-3 text-center",
      )}
    >
      {badge ? (
        <span className="absolute -top-2 left-3 z-10 rounded-full bg-gradient-to-r from-red-600 to-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-md">
          {badge}
        </span>
      ) : null}
      <span
        className={cn(
          "absolute top-3 right-3 flex size-6 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-gold bg-gradient-gold text-primary-foreground"
            : "border-border text-muted-foreground",
        )}
      >
        {selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
      </span>

      {emoji ? (
        emoji.startsWith("/") || emoji.startsWith("http") ? (
          <img
            src={emoji}
            alt={title}
            className={cn("size-8 object-contain", compact && "size-10")}
          />
        ) : (
          <span className={cn("text-2xl", compact && "text-3xl")}>{emoji}</span>
        )
      ) : null}
      <span
        className={cn(
          "pr-8 font-semibold text-foreground",
          compact && "pr-0 text-sm leading-tight",
        )}
      >
        {title}
      </span>
      {description ? (
        <span className="pr-8 text-xs text-muted-foreground">{description}</span>
      ) : null}
      {price ? <span className="font-display text-xl font-bold text-gold">{price}</span> : null}
    </button>
  );
}