import { useNavigate } from "react-router-dom";
import { FileText, X } from "lucide-react";
import { getNotes } from "../../services/notesService";
import type { Note } from "../../types";
import { useQuery } from "@tanstack/react-query";

export default function MyNotesPage({
  setShowMyNotes,
}: {
  setShowMyNotes: (show: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data, error, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const stripHTML = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] min-h-[600px] bg-white/90 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[#E8E6E1] overflow-hidden backdrop-blur-md popup-animate-in font-[family-name:var(--font-ui)]">
      {isLoading && (
        <div className="p-8 text-[#4A4A4A]">Loading...</div>
      )}
      {error && (
        <div className="p-8 text-red-500">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6E1]">
        <h2 className="text-sm font-medium text-[#2D2D2D]">My Notes</h2>
        <button
          onClick={() => setShowMyNotes(false)}
          className="p-1.5 rounded-xl text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0EEEA] transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-8 grid grid-cols-3 gap-6">

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

              <h2 className="font-medium text-[#2D2D2D] truncate">
                {note.title}
              </h2>
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
