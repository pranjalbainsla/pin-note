import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Folder, X } from "lucide-react";
import { createNote } from "../services/notesService";
import MyNotesFolder from "./folderPages/MyNotesFolderPage";
import MiscFolder from "./folderPages/MiscFolderPage";

export default function HomePage() {
  const navigate = useNavigate();
  const [showFolders, setShowFolders] = useState(false);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const [showMiscFolder, setShowMiscFolder] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateNote = async () => {
    try {
      setCreating(true);

      const response = await createNote("", "");

      navigate(`/editor/${response.note.id}`);
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[#F7F7F5] overflow-hidden font-[family-name:var(--font-ui)]">

      <div className="flex flex-col gap-4">

        <button
          onClick={handleCreateNote}
          disabled={creating}
          className="px-6 py-3 bg-[#2D2D2D] text-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition"
        >
          {creating ? "Creating..." : "Create a note"}
        </button>

        <button
          onClick={() => setShowFolders(true)}
          className="px-6 py-3 bg-white/80 border border-[#E8E6E1] text-[#4A4A4A] rounded-2xl shadow-sm hover:scale-[1.02] transition backdrop-blur-sm"
        >
          View Folders
        </button>
        <Link
          to="/"
          className="text-sm text-[#4A4A4A] hover:text-[#2D2D2D] transition text-center"
        >
          Logout
        </Link>
      </div>

      {showFolders && (
        <>
          <div
            className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"
            onClick={() => setShowFolders(false)}
          />

          <div className="absolute top-24 w-[500px] rounded-2xl bg-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-[#E8E6E1] overflow-hidden backdrop-blur-md popup-animate-in">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6E1]">
              <h2 className="text-sm font-medium text-[#2D2D2D]">Folders</h2>
              <button
                onClick={() => setShowFolders(false)}
                className="p-1.5 rounded-xl text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0EEEA] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 p-8">

              <div
                onClick={() => setShowMyNotes(true)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <Folder
                  size={72}
                  className="text-[#8A9A8A] group-hover:scale-105 transition"
                />

                <span className="mt-3 text-sm font-medium text-[#4A4A4A]">
                  My Notes
                </span>
              </div>

              <div
                onClick={() => setShowMiscFolder(true)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <Folder
                  size={72}
                  className="text-[#B0A090] group-hover:scale-105 transition"
                />
                <span className="mt-3 text-sm font-medium text-[#4A4A4A]">
                  Misc
                </span>
              </div>

            </div>
          </div>
        </>
      )}
      {showMyNotes && <MyNotesFolder setShowMyNotes={setShowMyNotes} />}
      {showMiscFolder && <MiscFolder setShowMiscFolder={setShowMiscFolder} />}
    </div>
  );
}
