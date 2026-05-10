import { API_BASE_URL } from "../config";

function getToken(): string {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found");
  }
  return token;
}

export async function getNotes() {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/notes/getAll`, {
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
    throw new Error(data.message || "Failed to fetch notes");
  }
  return res.json();
}

export async function getNoteById(noteId: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/notes/get/${noteId}`, {
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
    throw new Error(data.message || "Failed to fetch note");
  }
  return res.json();
}


export async function createNote(title: string = "", content: string = "") {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/notes/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    throw new Error(data.message || "Failed to create note");
  }

  return res.json();
}


export async function updateNote(
  noteId: string,
  title: string,
  content: string
) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/notes/update/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    throw new Error(data.message || "Failed to update note");
  }

  return res.json();
}
