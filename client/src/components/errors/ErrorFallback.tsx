import { useNavigate } from "react-router-dom";
import type { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-[var(--slate-muted)] p-8">
      <h1 className="text-2xl font-semibold text-[var(--slate-surface-text)]">
        Something went wrong
      </h1>
      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="text-sm px-4 py-2 rounded-lg border border-[var(--slate-border)] hover:bg-black/5"
        >
          Try again
        </button>
        <button
          onClick={() => {
            resetErrorBoundary();
            navigate("/home");
          }}
          className="text-sm px-4 py-2 rounded-lg bg-[var(--slate-surface-text)] text-[var(--slate-surface)] hover:opacity-90"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
