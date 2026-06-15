import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

const baseClassName =
  "p-2 rounded-xl text-[var(--slate-muted)] hover:text-[var(--slate-surface-text)] hover:bg-black/5 transition-colors";

const activeClassName = "bg-black/5 text-[var(--slate-surface-text)]";

type SidebarNavButtonProps = {
  to: string;
  ariaLabel: string;
  children: ReactNode;
  end?: boolean;
};

export function SidebarNavLink({ to, ariaLabel, children, end }: SidebarNavButtonProps) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `${baseClassName}${isActive ? ` ${activeClassName}` : ""}`
      }
    >
      {children}
    </NavLink>
  );
}

type SidebarActionButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
};

export function SidebarActionButton({ onClick, ariaLabel, children }: SidebarActionButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={baseClassName}>
      {children}
    </button>
  );
}
