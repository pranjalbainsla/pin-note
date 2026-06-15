import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { getNotes } from "@/services/notesService";
import type { Note } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function MyNotesPage() {
  const navigate = useNavigate();
  const { data, error, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const stripHTML = (html: string | null) => {
    const div = document.createElement("div");
    div.innerHTML = html ?? "";
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto px-6 py-10">
      <h1 className="text-lg font-medium text-[var(--slate-surface-text)] mb-8">My Notes</h1>

      {isLoading && <div className="text-[var(--slate-muted)]">Loading...</div>}
      {error && (
        <div className="text-red-500">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {data?.notes.map((note: Note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/editor/${note.id}`)}
            className="group cursor-pointer bg-[#FAFAF8] hover:bg-white border border-[#E8E6E1] rounded-2xl p-5 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText
                size={22}
                className="text-[#8A8A8A] group-hover:scale-105 transition"
              />

              <h2 className="font-medium text-[#2D2D2D] truncate">{note.title}</h2>
            </div>

            <p className="text-sm text-[#4A4A4A] line-clamp-3 leading-6 font-[family-name:var(--font-serif)]">
              {stripHTML(note.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
