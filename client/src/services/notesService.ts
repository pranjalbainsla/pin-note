import { apiFetch } from "./apiFetch";
import type { Note } from "../types";

type NotesResponse = {
  status: "ok";
  notes: Note[];
};

type NoteResponse = {
  status: "ok";
  note: Note;
};

type UpdateNoteResponse = {
  status: "ok";
};

export async function getNotes() {
  return apiFetch<NotesResponse>("/notes/getAll", {}, "Failed to fetch notes");
}

export async function getNoteById(noteId: string) {
  return apiFetch<NoteResponse>(`/notes/get/${noteId}`, {}, "Failed to fetch note");
}


export async function createNote(title: string = "", content: string = "") {
  return apiFetch<NoteResponse>("/notes/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  }, "Failed to create note");
}


export async function updateNote(
  noteId: string,
  title: string,
  content: string
) {
  return apiFetch<UpdateNoteResponse>(`/notes/update/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  }, "Failed to update note");
}
