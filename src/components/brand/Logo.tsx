import { cn } from "@/lib/utils";

export function Logo({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <img
      src="/logo.jpg"
      alt="Sr e Sra Massas"
      width={size}
      height={size}
      className={cn("rounded-full object-cover shadow-sm", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const logoUrl = "/logo.jpg";