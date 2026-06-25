import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { draftKey, type NoteDraft } from "@/types/noteDraft";

const DB_NAME = "better-note-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

interface NoteDraftDB extends DBSchema {
  drafts: {
    key: string;
    value: NoteDraft;
  };
}

let dbPromise: Promise<IDBPDatabase<NoteDraftDB>> | null = null;

function getDB(): Promise<IDBPDatabase<NoteDraftDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NoteDraftDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getDraft(
  userId: string,
  noteId: string,
): Promise<NoteDraft | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, draftKey(userId, noteId));
}

export async function putDraft(draft: NoteDraft): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, draft);
}

export async function deleteDraft(
  userId: string,
  noteId: string,
): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, draftKey(userId, noteId));
}

export async function deleteAllDraftsForUser(userId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const prefix = `${userId}:`;

  let cursor = await store.openCursor();
  while (cursor) {
    if (cursor.key.startsWith(prefix)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
}

export async function remapDraftKey(
  userId: string,
  fromNoteId: string,
  toNoteId: string,
): Promise<NoteDraft | undefined> {
  const oldKey = draftKey(userId, fromNoteId);
  const db = await getDB();
  const existing = await db.get(STORE_NAME, oldKey);

  if (!existing) {
    return undefined;
  }

  await db.delete(STORE_NAME, oldKey);

  const remapped: NoteDraft = {
    ...existing,
    key: draftKey(userId, toNoteId),
    noteId: toNoteId,
    serverNoteId: toNoteId,
  };

  await db.put(STORE_NAME, remapped);
  return remapped;
}
