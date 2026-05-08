import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { getNotes } from "../services/notesService";
import type { Note } from "../types";


export default function MyNotesFolder({ setShowMyNotes }: { setShowMyNotes: (show: boolean) => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await getNotes();
        setNotes(response.notes);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };

    fetchNotes();
  }, []);

  const stripHTML = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] min-h-[600px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">

      {/* mac window top bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
        <div className="w-3 h-3 rounded-full bg-red-400">
            <button onClick={() => setShowMyNotes(false)} className="w-full h-full rounded-full opacity-0 hover:opacity-100 transition" />
        </div>
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />

      </div>

      {/* notes grid */}
      <div className="p-8 grid grid-cols-3 gap-6">

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/editor/${note.id}`)}
            className="group cursor-pointer bg-[#fafafa] hover:bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-200"
          >

            <div className="flex items-center gap-3 mb-4">
              <FileText
                size={22}
                className="text-neutral-500 group-hover:scale-105 transition"
              />

              <h2 className="font-semibold text-neutral-800 truncate">
                {note.title}
              </h2>
            </div>

            <p className="text-sm text-neutral-500 line-clamp-3 leading-6">
              {stripHTML(note.content)}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}