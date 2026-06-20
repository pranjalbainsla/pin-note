import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import SlateSurface from "./SlateSurface";
import AppSidebar from "./AppSidebar";
import ErrorFallback from "@/components/errors/ErrorFallback";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--slate-page-bg)] p-4 sm:p-6">
      <SlateSurface variant="page" className="flex">
        <main className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            resetKeys={[location.pathname]}
          >
            {children}
          </ErrorBoundary>
        </main>

        <AppSidebar />
      </SlateSurface>
    </div>
  );
}
