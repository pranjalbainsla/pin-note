import type { NavigateFunction } from "react-router-dom";
import { NEW_NOTE_ID } from "@/constants/editor";
import { createNote, updateNote } from "@/services/notesService";
import { getDraft, putDraft, remapDraftKey } from "@/lib/noteDraftStore";
import { draftKey, type NoteDraft } from "@/types/noteDraft";

export async function syncDraft(
  draft: NoteDraft,
  navigate: NavigateFunction,
): Promise<NoteDraft> {
  const syncing: NoteDraft = { ...draft, syncStatus: "syncing" };
  await putDraft(syncing);

  try {
    const effectiveId =
      draft.serverNoteId ?? (draft.noteId === NEW_NOTE_ID ? null : draft.noteId);

    if (!effectiveId) {
      const { note } = await createNote(
        draft.title,
        draft.content,
        draft.fontSizePx,
      );

      await remapDraftKey(draft.userId, draft.noteId, note.id);

      const synced: NoteDraft = {
        ...draft,
        key: draftKey(draft.userId, note.id),
        noteId: note.id,
        serverNoteId: note.id,
        syncStatus: "synced",
        syncedAt: Date.now(),
      };
      await putDraft(synced);
      navigate(`/editor/${note.id}`, { replace: true });
      return synced;
    }

    await updateNote(
      effectiveId,
      draft.title,
      draft.content,
      draft.fontSizePx,
    );

    const synced: NoteDraft = {
      ...draft,
      serverNoteId: effectiveId,
      syncStatus: "synced",
      syncedAt: Date.now(),
    };
    await putDraft(synced);
    return synced;
  } catch (err) {
    const failed: NoteDraft = { ...draft, syncStatus: "failed" };
    await putDraft(failed);
    throw err;
  }
}

export async function getDraftNeedsSync(
  userId: string,
  noteId: string,
): Promise<boolean> {
  const draft = await getDraft(userId, noteId);
  return draft?.syncStatus === "pending" || draft?.syncStatus === "failed";
}
