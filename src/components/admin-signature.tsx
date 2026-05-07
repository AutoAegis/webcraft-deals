import { Flame } from "lucide-react";

export function AdminSignature({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase text-xs tracking-wider ${className}`}
      style={{
        color: "oklch(0.78 0.16 220)",
        textShadow: "0 0 8px oklch(0.78 0.16 220 / 0.6), 0 0 18px oklch(0.78 0.16 220 / 0.35)",
      }}
    >
      <Flame
        className="size-4 animate-pulse"
        style={{
          filter: "drop-shadow(0 0 4px oklch(0.78 0.16 220 / 0.9)) drop-shadow(0 0 10px oklch(0.78 0.16 220 / 0.6))",
        }}
      />
      Auto
    </span>
  );
}