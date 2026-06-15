import type { ReactNode } from "react";
import { X } from "lucide-react";
import SlateSurface from "@/components/layout/SlateSurface";

type FolderPanelProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export default function FolderPanel({
  title,
  onClose,
  children,
  className = "",
  bodyClassName = "",
}: FolderPanelProps) {
  return (
    <SlateSurface variant="modal" className={className}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--slate-border)]">
        <h2 className="text-sm font-medium text-[var(--slate-surface-text)]">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[var(--slate-muted)] hover:text-[var(--slate-surface-text)] hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className={bodyClassName}>{children}</div>
    </SlateSurface>
  );
}
