import { API_BASE_URL } from "@/config";

function getToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }
  return token;
}

function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed",
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, fallbackMessage));
  }

  return res.json();
}
