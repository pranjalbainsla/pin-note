import { API_BASE_URL } from "../config";

function getToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }
  return token;
}

export async function getPins() {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/pins/getAll`, {
    headers: {
        Authorization: `Bearer ${token}`,
    }
  });
  if (!res.ok) {
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }
    const data = await res.json();
    throw new Error(data.message || "Failed to fetch pins");
  }
  return res.json();
}

export async function createPin(url: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/pins/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }
    const data = await res.json();
    throw new Error(data.message || "Failed to create pin");
  }
  return res.json();
}