import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  STORAGE_KEY,
  ThemeContext,
  type Theme,
} from "@/context/theme-context";

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

const THEME_TRANSITION_MS = 300;

function applyTheme(theme: Theme, animate = false) {
  if (animate) {
    document.documentElement.classList.add("theme-changing");
  }

  document.documentElement.dataset.theme = theme;

  if (animate) {
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-changing");
    }, THEME_TRANSITION_MS);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const animate = !isInitialMount.current;
    isInitialMount.current = false;

    applyTheme(theme, animate);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
