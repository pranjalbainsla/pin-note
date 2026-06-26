import { API_BASE_URL } from "@/config";
import type { User } from "@/types";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

type JwtPayload = {
  sub?: string;
  email?: string;
  user_metadata?: { email?: string };
};

export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser) as User;
    return parsed?.id ? parsed : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function parseUserFromAccessToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    if (!payload.sub) return null;

    return {
      id: payload.sub,
      email: payload.email ?? payload.user_metadata?.email ?? "",
    };
  } catch {
    return null;
  }
}

/** Keep local user in sync when tokens exist but the user object was cleared. */
export function ensureStoredUser(accessToken: string | null): User | null {
  const stored = getStoredUser();
  if (stored) return stored;

  if (!accessToken) return null;

  const derived = parseUserFromAccessToken(accessToken);
  if (derived) {
    setStoredUser(derived);
  }

  return derived;
}

let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.dispatchEvent(new CustomEvent("auth:tokens-updated"));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent("auth:cleared"));
}

export function isAccessTokenExpired(
  token: string,
  bufferSeconds = 60,
): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as {
        token: string;
        refresh_token: string;
      };

      setTokens(data.token, data.refresh_token);
      return data.token;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
