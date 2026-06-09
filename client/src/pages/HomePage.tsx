import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Folder, X } from "lucide-react";
import { createNote } from "../services/notesService";
import MyNotesFolder from "./folderPages/MyNotesFolderPage";
import MiscFolder from "./folderPages/MiscFolderPage";

export default function HomePage() {
  const navigate = useNavigate();
  const [showFolders, setShowFolders] = useState(false);
  //TODO: change cross button to add close functionality to red button in top left of mac style window
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
    <div className="relative flex flex-col items-center justify-center h-screen bg-[#f5f5f7] overflow-hidden">

      <div className="flex flex-col gap-4">

        <button
          onClick={handleCreateNote}
          disabled={creating}
          className="px-6 py-3 bg-black text-white rounded-2xl shadow-md hover:scale-[1.02] transition"
        >
          {creating ? "Creating..." : "Create a note"}
        </button>

        <button
          onClick={() => setShowFolders(true)}
          className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl shadow-md hover:scale-[1.02] transition"
        >
          View Folders
        </button>
        <Link to="/" className="text-sm text-neutral-500 hover:text-black transition">
          Logout
        </Link>
      </div>

      {showFolders && (
        <>
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setShowFolders(false)}
          />

          {/* floating mac-style window */}
          <div className="absolute top-24 w-[500px] rounded-3xl bg-white shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">

              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              <button
                onClick={() => setShowFolders(false)}
                className="text-neutral-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {/* folders */}
            <div className="grid grid-cols-2 gap-8 p-8">

                <div
                    onClick={() => setShowMyNotes(true)}
                    className="flex flex-col items-center cursor-pointer group"
                >
                    <Folder
                        size={72}
                        className="text-blue-500 group-hover:scale-105 transition"
                    />

                    <span className="mt-3 text-sm font-medium">
                        My Notes
                    </span>
                </div>

              <div onClick={() => setShowMiscFolder(true)} className="flex flex-col items-center cursor-pointer group">
                <Folder
                  size={72}
                  className="text-blue-500 group-hover:scale-105 transition"
                />
                <span className="mt-3 text-sm font-medium">
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