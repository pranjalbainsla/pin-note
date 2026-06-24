import { API_BASE_URL } from "@/config";
import {
  clearAuth,
  getAccessToken,
  refreshAccessToken,
} from "./authStorage";

function handleUnauthorized() {
  clearAuth();
  window.location.href = "/";
}

async function getErrorMessage(res: Response, fallbackMessage: string) {
  try {
    const data = await res.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function fetchWithAuth(
  path: string,
  options: RequestInit,
  token: string,
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed",
): Promise<T> {
  let token = getAccessToken();
  if (!token) {
    throw new Error("No auth token found");
  }

  let res = await fetchWithAuth(path, options, token);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      handleUnauthorized();
      throw new Error("Session expired");
    }

    res = await fetchWithAuth(path, options, newToken);
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, fallbackMessage));
  }

  return res.json();
}
