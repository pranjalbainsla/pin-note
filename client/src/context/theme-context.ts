import { createContext } from "react";

export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
