import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Editor } from "@tiptap/react";
import { getNoteById } from "@/services/notesService";
import {
  deleteDraft,
  getDraft,
  upsertDraftFromEditor,
} from "@/lib/noteDraftStore";
import { getDraftNeedsSync, syncDraft } from "@/lib/noteSync";
import getCleanHTML from "@/utils/getCleanHTML";
import { isNoteEmpty } from "@/utils/isNoteEmpty";
import type { NoteDraft } from "@/types/noteDraft";
import type { Note } from "@/types";
import {
  clampFontSizePx,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE_PX,
  NEW_NOTE_ID,
  nextFontFamily,
  normalizeFontFamily,
  type NoteFontFamily,
} from "@/constants/editor";

interface NotePresentation {
  fontSizePx: number;
  fontFamily: NoteFontFamily;
}

interface UseNoteReturn {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  fontSizePx: number;
  setFontSizePx: React.Dispatch<React.SetStateAction<number>>;
  fontFamily: NoteFontFamily;
  setFontFamily: React.Dispatch<React.SetStateAction<NoteFontFamily>>;
  isLoading: boolean;
  error: string;
  fetchNote: () => Promise<void>;
  saveNote: () => Promise<void>;
  saveFontSize: (nextSize: number) => Promise<void>;
  saveFontFamily: (nextFamily: NoteFontFamily) => Promise<void>;
  cycleFontFamily: () => Promise<void>;
  persistLocalDraft: (overrides?: {
    title?: string;
    fontSizePx?: number;
    fontFamily?: NoteFontFamily;
  }) => Promise<void>;
  retryPendingSync: () => Promise<void>;
}

function draftContentMatches(
  draft: NoteDraft,
  title: string,
  content: string,
  presentation: NotePresentation,
): boolean {
  return (
    draft.title === title &&
    draft.content === content &&
    draft.fontSizePx === presentation.fontSizePx &&
    draft.fontFamily === presentation.fontFamily
  );
}

function applyDraftToState(
  draft: NoteDraft,
  persistedNoteIdRef: React.MutableRefObject<string | null>,
  setTitle: React.Dispatch<React.SetStateAction<string>>,
  setFontSizePx: React.Dispatch<React.SetStateAction<number>>,
  setFontFamily: React.Dispatch<React.SetStateAction<NoteFontFamily>>,
  setNoteContent: React.Dispatch<React.SetStateAction<string | null>>,
) {
  if (draft.serverNoteId) {
    persistedNoteIdRef.current = draft.serverNoteId;
  }
  setTitle(draft.title);
  setFontSizePx(clampFontSizePx(draft.fontSizePx));
  setFontFamily(normalizeFontFamily(draft.fontFamily));
  setNoteContent(draft.content);
}

/**
 * Owns all state and async logic for a single note.
 * Content is loaded into the Tiptap editor via setContent once both
 * the editor instance and fetched HTML are available.
 */
export function useNote(
  noteId: string | undefined,
  editor: Editor | null,
  userId: string | undefined,
): UseNoteReturn {
  const navigate = useNavigate();
  const persistedNoteIdRef = useRef<string | null>(null);
  const prevNoteIdRef = useRef<string | undefined>(noteId);
  const syncChainRef = useRef(Promise.resolve());
  const [title, setTitle] = useState("");
  const [fontSizePx, setFontSizePx] = useState(DEFAULT_FONT_SIZE_PX);
  const [fontFamily, setFontFamily] = useState<NoteFontFamily>(DEFAULT_FONT_FAMILY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteContent, setNoteContent] = useState<string | null>(null);

  const isDraft = noteId === NEW_NOTE_ID;

  useEffect(() => {
    const prevNoteId = prevNoteIdRef.current;
    prevNoteIdRef.current = noteId;

    if (noteId === persistedNoteIdRef.current) {
      return;
    }

    const skipReset =
      prevNoteId === NEW_NOTE_ID && noteId === persistedNoteIdRef.current;

    if (skipReset) {
      return;
    }

    persistedNoteIdRef.current = null;
    setTitle("");
    setFontSizePx(DEFAULT_FONT_SIZE_PX);
    setFontFamily(DEFAULT_FONT_FAMILY);
    setError("");
    setNoteContent(isDraft ? "" : null);
  }, [noteId, isDraft]);

  useEffect(() => {
    if (!editor || noteContent === null) return;
    editor.commands.setContent(noteContent, false);
    setNoteContent(null);
  }, [editor, noteContent]);

  const getEditorSnapshot = useCallback(
    (nextPresentation: NotePresentation) => {
      if (!editor) return null;
      const content = getCleanHTML(editor.getHTML());
      return { content, ...nextPresentation };
    },
    [editor],
  );

  const persistLocalDraft = useCallback(
    async (overrides?: {
      title?: string;
      fontSizePx?: number;
      fontFamily?: NoteFontFamily;
    }) => {
      if (!editor || !noteId || !userId) return;

      const draftTitle = overrides?.title ?? title;
      const draftPresentation: NotePresentation = {
        fontSizePx: overrides?.fontSizePx ?? fontSizePx,
        fontFamily: overrides?.fontFamily ?? fontFamily,
      };
      const snapshot = getEditorSnapshot(draftPresentation);
      if (!snapshot) return;

      const { content, fontSizePx: draftFontSizePx, fontFamily: draftFontFamily } =
        snapshot;
      if (isNoteEmpty(draftTitle, content)) return;

      const serverNoteId =
        persistedNoteIdRef.current ?? (isDraft ? null : noteId);

      await upsertDraftFromEditor({
        userId,
        noteId,
        serverNoteId,
        title: draftTitle,
        content,
        fontSizePx: draftFontSizePx,
        fontFamily: draftFontFamily,
      });
    },
    [editor, noteId, userId, title, fontSizePx, fontFamily, isDraft, getEditorSnapshot],
  );

  const fetchNote = useCallback(async () => {
    if (!noteId) return;

    if (!userId) {
      setError("Unable to load user session. Please log in again.");
      setIsLoading(false);
      return;
    }

    if (noteId === persistedNoteIdRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    let serverNote: Note | null = null;
    let fetchFailed = false;

    if (!isDraft) {
      try {
        const { note } = await getNoteById(noteId);
        serverNote = note;
      } catch (err) {
        fetchFailed = true;
        console.error("Failed to fetch note:", err);
      }
    }

    if (isDraft) {
      await deleteDraft(userId, noteId);
      setIsLoading(false);
      return;
    }

    const localDraft = await getDraft(userId, noteId);

    const serverUpdatedAt = serverNote?.updated_at
      ? Date.parse(serverNote.updated_at)
      : 0;

    const useLocal =
      localDraft &&
      (fetchFailed || localDraft.localUpdatedAt > serverUpdatedAt);

    if (useLocal && localDraft) {
      if (fetchFailed) {
        setError("Failed to load note. Showing your local draft.");
      } else {
        setError("");
      }
      applyDraftToState(
        localDraft,
        persistedNoteIdRef,
        setTitle,
        setFontSizePx,
        setFontFamily,
        setNoteContent,
      );
    } else if (serverNote) {
      persistedNoteIdRef.current = serverNote.id;
      setTitle(serverNote.title);
      setFontSizePx(
        clampFontSizePx(serverNote.font_size_px ?? DEFAULT_FONT_SIZE_PX),
      );
      setFontFamily(normalizeFontFamily(serverNote.font_family ?? DEFAULT_FONT_FAMILY));
      setNoteContent(serverNote.content ?? "");
      setError("");

      await upsertDraftFromEditor({
        userId,
        noteId,
        serverNoteId: serverNote.id,
        title: serverNote.title,
        content: serverNote.content ?? "",
        fontSizePx: clampFontSizePx(
          serverNote.font_size_px ?? DEFAULT_FONT_SIZE_PX,
        ),
        fontFamily: normalizeFontFamily(
          serverNote.font_family ?? DEFAULT_FONT_FAMILY,
        ),
        syncStatus: "synced",
        syncedAt: serverUpdatedAt || Date.now(),
      });
    } else {
      setError("Failed to load note. Please try again later.");
    }

    setIsLoading(false);
  }, [noteId, userId, isDraft]);

  const persistNote = useCallback(
    async (nextPresentation: NotePresentation) => {
      if (!editor || !noteId || !userId) return;

      const snapshot = getEditorSnapshot(nextPresentation);
      if (!snapshot) return;

      const { content } = snapshot;
      if (isNoteEmpty(title, content)) return;

      const serverNoteId =
        persistedNoteIdRef.current ?? (isDraft ? null : noteId);

      const existing = await getDraft(userId, persistedNoteIdRef.current ?? noteId);
      if (
        existing?.syncStatus === "synced" &&
        draftContentMatches(existing, title, content, nextPresentation)
      ) {
        return;
      }

      const runSync = async () => {
        const resolvedServerId = persistedNoteIdRef.current ?? serverNoteId;
        const resolvedNoteId = resolvedServerId ?? noteId;

        const draft = await upsertDraftFromEditor({
          userId,
          noteId: resolvedNoteId,
          serverNoteId: resolvedServerId,
          title,
          content,
          fontSizePx: nextPresentation.fontSizePx,
          fontFamily: nextPresentation.fontFamily,
        });

        setError("");
        const synced = await syncDraft(draft);
        if (synced.serverNoteId) {
          persistedNoteIdRef.current = synced.serverNoteId;
        }
        if (synced.navigateToId) {
          navigate(`/editor/${synced.navigateToId}`, { replace: true });
        }
      };

      try {
        syncChainRef.current = syncChainRef.current
          .catch(() => {})
          .then(() => runSync());
        await syncChainRef.current;
      } catch (err) {
        setError("Auto-save failed. Please try again.");
        console.error("Auto-save failed:", err);
      }
    },
    [editor, noteId, userId, isDraft, title, navigate, getEditorSnapshot],
  );

  const saveNote = useCallback(async () => {
    await persistNote({ fontSizePx, fontFamily });
  }, [persistNote, fontSizePx, fontFamily]);

  const retryPendingSync = useCallback(async () => {
    if (!noteId || !userId) return;
    const needsSync = await getDraftNeedsSync(userId, noteId);
    if (needsSync) {
      await saveNote();
    }
  }, [noteId, userId, saveNote]);

  const saveFontSize = useCallback(
    async (nextSize: number) => {
      if (!editor || !noteId) return;
      const clamped = clampFontSizePx(nextSize);
      const nextPresentation = { fontSizePx: clamped, fontFamily };
      setFontSizePx(clamped);
      await persistLocalDraft({ fontSizePx: clamped });
      await persistNote(nextPresentation);
    },
    [editor, noteId, fontFamily, persistLocalDraft, persistNote],
  );

  const saveFontFamily = useCallback(
    async (nextFamily: NoteFontFamily) => {
      if (!editor || !noteId) return;
      const normalized = normalizeFontFamily(nextFamily);
      const nextPresentation = { fontSizePx, fontFamily: normalized };
      setFontFamily(normalized);
      await persistLocalDraft({ fontFamily: normalized });
      await persistNote(nextPresentation);
    },
    [editor, noteId, fontSizePx, persistLocalDraft, persistNote],
  );

  const cycleFontFamily = useCallback(async () => {
    await saveFontFamily(nextFontFamily(fontFamily));
  }, [fontFamily, saveFontFamily]);

  return {
    title,
    setTitle,
    fontSizePx,
    setFontSizePx,
    fontFamily,
    setFontFamily,
    isLoading,
    error,
    fetchNote,
    saveNote,
    saveFontSize,
    saveFontFamily,
    cycleFontFamily,
    persistLocalDraft,
    retryPendingSync,
  };
}
