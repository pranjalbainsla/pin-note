import { useNavigate } from "react-router-dom";
import type { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-neutral-700">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="text-sm px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
        >
          Try again
        </button>
        <button
          onClick={() => { resetErrorBoundary(); navigate("/home"); }}
          className="text-sm px-4 py-2 rounded-lg bg-black text-white hover:bg-neutral-800"
        >
          Go home
        </button>
      </div>
    </div>
  );
}