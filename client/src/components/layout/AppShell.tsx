import type { ReactNode } from "react";
import SlateSurface from "./SlateSurface";
import ThemeToggle from "./ThemeToggle";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--slate-page-bg)] p-4 sm:p-6">
      <SlateSurface variant="page" className="flex">
        <main className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {children}
        </main>

        <aside className="flex shrink-0 flex-col items-center border-l border-[var(--slate-border)] px-3 py-4">
          <ThemeToggle />
        </aside>
      </SlateSurface>
    </div>
  );
}
