import logoAsset from "@/assets/logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <img
      src={logoAsset.url}
      alt="Sr e Sra Massas"
      width={size}
      height={size}
      className={cn("rounded-full object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const logoUrl = logoAsset.url;