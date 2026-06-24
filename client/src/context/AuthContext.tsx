import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, AuthContextType } from "@/types";
import { API_BASE_URL } from "@/config";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  refreshAccessToken,
  setTokens,
} from "@/services/authStorage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function hasStoredSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(hasStoredSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      const accessToken = getAccessToken();
      if (accessToken && !isAccessTokenExpired(accessToken)) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      const newToken = await refreshAccessToken();
      if (cancelled) {
        return;
      }

      if (!newToken) {
        clearAuth();
        setUser(null);
        setToken(null);
      } else {
        setToken(newToken);
      }

      setIsBootstrapping(false);
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      setToken(getAccessToken());
      setUser(getStoredUser());
    };

    const handleCleared = () => {
      setUser(null);
      setToken(null);
      setError(null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "token" ||
        event.key === "refresh_token" ||
        event.key === "user"
      ) {
        syncFromStorage();
      }
    };

    window.addEventListener("auth:tokens-updated", syncFromStorage);
    window.addEventListener("auth:cleared", handleCleared);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth:tokens-updated", syncFromStorage);
      window.removeEventListener("auth:cleared", handleCleared);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const persistSession = (session: {
    user: User;
    token: string;
    refresh_token: string;
  }) => {
    setUser(session.user);
    setToken(session.token);
    setTokens(session.token, session.refresh_token);
    localStorage.setItem("user", JSON.stringify(session.user));
  };

  const authenticate = async (
    endpoint: "login" | "register",
    email: string,
    password: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token || !data.refresh_token) {
        throw new Error("Authentication response was incomplete");
      }

      persistSession(data);
    } catch (err) {
      console.error("Authentication error:", err);

      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to connect to the server. Please try again later.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (email: string, password: string) => {
    return authenticate("login", email, password);
  };

  const register = (email: string, password: string) => {
    return authenticate("register", email, password);
  };

  const logout = async () => {
    const accessToken = getAccessToken();

    if (accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Local logout still proceeds if the server is unreachable.
      }
    }

    clearAuth();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isBootstrapping,
        error,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token || getRefreshToken()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
