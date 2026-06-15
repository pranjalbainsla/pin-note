import type { ReactNode } from "react";

type SlateSurfaceVariant = "page" | "modal";

type SlateSurfaceProps = {
  variant: SlateSurfaceVariant;
  children: ReactNode;
  className?: string;
};

const surfaceBase =
  "bg-[var(--slate-surface)] text-[var(--slate-surface-text)] rounded-2xl border border-[var(--slate-border)] shadow-[var(--slate-shadow)] backdrop-blur-md font-[family-name:var(--font-ui)]";

const variantClasses: Record<SlateSurfaceVariant, string> = {
  page: "w-[var(--slate-width)] h-[var(--slate-height)] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] popup-animate-in overflow-hidden",
  modal:
    "absolute left-1/2 -translate-x-1/2 popup-animate-in overflow-hidden z-10",
};

export default function SlateSurface({
  variant,
  children,
  className = "",
}: SlateSurfaceProps) {
  return (
    <div className={`${surfaceBase} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
