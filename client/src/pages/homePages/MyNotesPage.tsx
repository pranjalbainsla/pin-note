import { useNavigate } from "react-router-dom";
import { getNotes } from "@/services/notesService";
import type { Note } from "@/types";
import { formatNoteDate, noteListTitle } from "@/utils/noteDisplay";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export default function MyNotesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { data, error, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
    enabled: isAuthenticated && !isBootstrapping,
    refetchOnMount: "always",
  });

  const notes = data?.notes ?? [];

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-6 py-10">
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-[var(--slate-surface-text)] font-[family-name:var(--font-serif)] mb-8">
          My notes
        </h1>

        {isLoading && (
          <div className="text-[var(--slate-muted)] font-[family-name:var(--font-ui)]">Loading...</div>
        )}

        {error && (
          <div className="text-red-500 font-[family-name:var(--font-ui)]">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <div className="text-[var(--slate-muted)] font-[family-name:var(--font-ui)]">No notes yet.</div>
        )}

        {!isLoading && !error && notes.length > 0 && (
          <ul className="flex flex-col">
            {notes.map((note: Note, index) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/editor/${note.id}`)}
                  className={`flex w-full items-center justify-between gap-4 py-3.5 text-left cursor-pointer rounded-xl hover:bg-black/[0.03] transition-colors duration-150 border-b border-[var(--slate-border)]${index === 0 ? " border-t" : ""}`}
                >
                  <span className="min-w-0 truncate px-2 font-medium text-[var(--slate-surface-text)] font-[family-name:var(--font-ui)]">
                    {noteListTitle(note.title)}
                  </span>
                  <span className="shrink-0 text-sm px-2 text-[var(--slate-muted)] font-[family-name:var(--font-ui)]">
                    {formatNoteDate(note.updated_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
