import type { ReactNode } from "react";
import { X } from "lucide-react";

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
    <div
      className={`absolute left-1/2 -translate-x-1/2 bg-white/90 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[#E8E6E1] overflow-hidden backdrop-blur-md popup-animate-in font-[family-name:var(--font-ui)] ${className}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6E1]">
        <h2 className="text-sm font-medium text-[#2D2D2D]">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0EEEA] transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
