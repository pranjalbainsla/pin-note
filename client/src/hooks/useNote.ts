import { useCallback, useRef, useState } from "react";
import { getNoteById, updateNote } from "@/services/notesService";
import getCleanHTML from "@/utils/getCleanHTML";

interface UseNoteReturn {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  editorRef: React.RefObject<HTMLDivElement>;
  fetchNote: () => Promise<void>;
  saveNote: () => Promise<void>;
}

/**
 * Owns all state and async logic for a single note.
 * editorRef lives here (not in the component) because it's logically
 * part of note data, not view structure.
 */
export function useNote(noteId: string | undefined): UseNoteReturn {
  const [title, setTitle]         = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [error, setError]         = useState("");
  const editorRef                 = useRef<HTMLDivElement>(null);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    try {
      setIsLoading(true);
      const { note } = await getNoteById(noteId);
      setTitle(note.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content ?? "";
      }
    } catch (err) {
      setError("Failed to load note. Please try again later.");
      console.error("Failed to fetch note:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  const saveNote = useCallback(async () => {
    if (!editorRef.current || !noteId) return;
    const content = getCleanHTML(editorRef.current);
    setIsSaving(true);
    try {
      await updateNote(noteId, title, content);
    } catch (err) {
      setError("Auto-save failed. Please try again.");
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title]);

  return { title, setTitle, isLoading, isSaving, error, editorRef, fetchNote, saveNote };
}
