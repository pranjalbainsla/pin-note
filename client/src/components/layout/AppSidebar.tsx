import { FileText, Home, LogOut, Pin } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { SidebarActionButton, SidebarNavLink } from "./SidebarNavButton";

const AUTH_PATHS = ["/", "/register"];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isAuthPage = AUTH_PATHS.includes(pathname);
  const showHome = !isAuthPage && pathname !== "/home";

  return (
    <aside className="flex shrink-0 self-stretch flex-col items-center border-l border-[var(--slate-border)] px-3 py-4 min-h-0">
      <div className="flex flex-col items-center gap-2">
        <ThemeToggle />

        {!isAuthPage && (
          <>
            <SidebarNavLink to="/mynotes" ariaLabel="My notes">
              <FileText size={18} />
            </SidebarNavLink>
            <SidebarNavLink to="/mypins" ariaLabel="My pins">
              <Pin size={18} />
            </SidebarNavLink>
          </>
        )}
      </div>

      {!isAuthPage && (
        <div className="mt-auto flex flex-col items-center gap-2">
          {showHome && (
            <SidebarNavLink to="/home" ariaLabel="Home" end>
              <Home size={18} />
            </SidebarNavLink>
          )}
          <SidebarActionButton onClick={logout} ariaLabel="Logout">
            <LogOut size={18} />
          </SidebarActionButton>
        </div>
      )}
    </aside>
  );
}
