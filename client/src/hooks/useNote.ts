import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Editor } from "@tiptap/react";
import { createNote, getNoteById, updateNote } from "@/services/notesService";
import getCleanHTML from "@/utils/getCleanHTML";
import { isNoteEmpty } from "@/utils/isNoteEmpty";
import {
  clampFontSizePx,
  DEFAULT_FONT_SIZE_PX,
  NEW_NOTE_ID,
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
  const navigate = useNavigate();
  const persistedNoteIdRef = useRef<string | null>(null);
  const prevNoteIdRef = useRef<string | undefined>(noteId);
  const [title, setTitle] = useState("");
  const [fontSizePx, setFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [noteContent, setNoteContent] = useState<string | null>(null);

  const isDraft = noteId === NEW_NOTE_ID;

  useEffect(() => {
    const prevNoteId = prevNoteIdRef.current;
    prevNoteIdRef.current = noteId;

    if (prevNoteId === NEW_NOTE_ID && noteId === persistedNoteIdRef.current) {
      return;
    }

    persistedNoteIdRef.current = null;
    setTitle("");
    setFontSizePx(DEFAULT_FONT_SIZE_PX);
    setError("");
    setNoteContent(isDraft ? "" : null);
  }, [noteId, isDraft]);

  useEffect(() => {
    if (!editor || noteContent === null) return;
    editor.commands.setContent(noteContent, false);
    setNoteContent(null);
  }, [editor, noteContent]);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;

    if (isDraft) {
      setIsLoading(false);
      return;
    }

    if (noteId === persistedNoteIdRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { note } = await getNoteById(noteId);
      persistedNoteIdRef.current = note.id;
      setTitle(note.title);
      setFontSizePx(clampFontSizePx(note.font_size_px ?? DEFAULT_FONT_SIZE_PX));
      setNoteContent(note.content ?? "");
    } catch (err) {
      setError("Failed to load note. Please try again later.");
      console.error("Failed to fetch note:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, isDraft]);

  const persistNote = useCallback(
    async (nextFontSizePx: number) => {
      if (!editor || !noteId) return;

      const content = getCleanHTML(editor.getHTML());
      if (isNoteEmpty(title, content)) return;

      const effectiveId =
        persistedNoteIdRef.current ?? (isDraft ? null : noteId);

      setIsSaving(true);
      try {
        if (!effectiveId) {
          const { note } = await createNote(title, content, nextFontSizePx);
          persistedNoteIdRef.current = note.id;
          navigate(`/editor/${note.id}`, { replace: true });
        } else {
          await updateNote(effectiveId, title, content, nextFontSizePx);
        }
      } catch (err) {
        setError("Auto-save failed. Please try again.");
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [editor, noteId, isDraft, title, navigate],
  );

  const saveNote = useCallback(async () => {
    await persistNote(fontSizePx);
  }, [persistNote, fontSizePx]);

  const saveFontSize = useCallback(
    async (nextSize: number) => {
      if (!editor || !noteId) return;
      const clamped = clampFontSizePx(nextSize);
      setFontSizePx(clamped);
      await persistNote(clamped);
    },
    [editor, noteId, persistNote],
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
