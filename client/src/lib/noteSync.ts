import { NEW_NOTE_ID } from "@/constants/editor";
import { createNote, updateNote } from "@/services/notesService";
import { getDraft, putDraft, remapDraftKey } from "@/lib/noteDraftStore";
import { queryClient } from "@/lib/queryClient";
import { draftKey, type NoteDraft } from "@/types/noteDraft";

export type SyncDraftResult = NoteDraft & { navigateToId?: string };

export async function syncDraft(draft: NoteDraft): Promise<SyncDraftResult> {
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
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      return { ...synced, navigateToId: note.id };
    }

    if (draft.title.trim() === "") {
      return draft;
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
    await queryClient.invalidateQueries({ queryKey: ["notes"] });
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
