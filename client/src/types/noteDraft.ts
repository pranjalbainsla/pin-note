import type { NoteFontFamily } from "@/constants/editor";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface NoteDraft {
  key: string;
  userId: string;
  noteId: string;
  serverNoteId: string | null;
  title: string;
  content: string;
  fontSizePx: number;
  fontFamily: NoteFontFamily;
  localUpdatedAt: number;
  syncedAt: number | null;
  syncStatus: SyncStatus;
}

export function draftKey(userId: string, noteId: string): string {
  return `${userId}:${noteId}`;
}
