import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { getNoteById, updateNote } from "@/services/notesService";
import getCleanHTML from "@/utils/getCleanHTML";
import {
  clampFontSizePx,
  DEFAULT_FONT_SIZE_PX,
} from "@/constants/editor";

interface UseNoteReturn {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  fontSizePx: number;
  setFontSizePx: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  fetchNote: () => Promise<void>;
  saveNote: () => Promise<void>;
  saveFontSize: (nextSize: number) => Promise<void>;
}

/**
 * Owns all state and async logic for a single note.
 * Content is loaded into the Tiptap editor via setContent once both
 * the editor instance and fetched HTML are available.
 */
export function useNote(
  noteId: string | undefined,
  editor: Editor | null,
): UseNoteReturn {
  const [title, setTitle] = useState("");
  const [fontSizePx, setFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [noteContent, setNoteContent] = useState<string | null>(null);

  useEffect(() => {
    if (!editor || noteContent === null) return;
    editor.commands.setContent(noteContent, false);
    setNoteContent(null);
  }, [editor, noteContent]);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    try {
      setIsLoading(true);
      const { note } = await getNoteById(noteId);
      setTitle(note.title);
      setFontSizePx(clampFontSizePx(note.font_size_px ?? DEFAULT_FONT_SIZE_PX));
      setNoteContent(note.content ?? "");
    } catch (err) {
      setError("Failed to load note. Please try again later.");
      console.error("Failed to fetch note:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  const saveNote = useCallback(async () => {
    if (!editor || !noteId) return;
    const content = getCleanHTML(editor.getHTML());
    setIsSaving(true);
    try {
      await updateNote(noteId, title, content, fontSizePx);
    } catch (err) {
      setError("Auto-save failed. Please try again.");
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [editor, noteId, title, fontSizePx]);

  const saveFontSize = useCallback(
    async (nextSize: number) => {
      if (!editor || !noteId) return;
      const clamped = clampFontSizePx(nextSize);
      setFontSizePx(clamped);
      const content = getCleanHTML(editor.getHTML());
      setIsSaving(true);
      try {
        await updateNote(noteId, title, content, clamped);
      } catch (err) {
        setError("Auto-save failed. Please try again.");
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [editor, noteId, title],
  );

  return {
    title,
    setTitle,
    fontSizePx,
    setFontSizePx,
    isLoading,
    isSaving,
    error,
    fetchNote,
    saveNote,
    saveFontSize,
  };
}
