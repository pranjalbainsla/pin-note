import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Folder, Pin, Plus } from "lucide-react";
import FolderPanel from "@/components/home/FolderPanel";
import { createNote } from "@/services/notesService";
import AddPinPage from "./AddPinPage";
import MyNotesPage from "./MyNotesPage";
import MyPinsPage from "./MyPinsPage";

export default function HomePage() {
  const navigate = useNavigate();
  const [showFolders, setShowFolders] = useState(false);
  const [showMyNotes, setShowMyNotes] = useState(false);
  const [showMyPins, setShowMyPins] = useState(false);
  const [showAddPin, setShowAddPin] = useState(false);
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

          <FolderPanel
            title="Folders"
            onClose={() => setShowFolders(false)}
            className="top-24 w-[560px]"
            bodyClassName="grid grid-cols-3 gap-8 p-8"
          >

            <div
              onClick={() => setShowMyNotes(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <FileText
                size={72}
                className="text-[#8A9A8A] group-hover:scale-105 transition"
              />

              <span className="mt-3 text-sm font-medium text-[#4A4A4A]">
                My Notes
              </span>
            </div>

            <div
              onClick={() => setShowMyPins(true)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <Pin
                size={72}
                className="text-[#8EA3B0] group-hover:scale-105 transition"
              />
              <span className="mt-3 text-sm font-medium text-[#4A4A4A]">
                My Pins
              </span>
            </div>

            <div
              onClick={() => setShowAddPin(true)}
              className="relative flex flex-col items-center cursor-pointer group"
            >
              <Folder
                size={72}
                className="text-[#B0A090] group-hover:scale-105 transition"
              />
              <Plus
                size={26}
                className="absolute mt-11 ml-12 text-[#6A6A6A] bg-white rounded-full"
              />
              <span className="mt-3 text-sm font-medium text-[#4A4A4A]">
                Add Pin
              </span>
            </div>

          </FolderPanel>
        </>
      )}
      {showMyNotes && <MyNotesPage setShowMyNotes={setShowMyNotes} />}
      {showMyPins && <MyPinsPage setShowMyPins={setShowMyPins} />}
      {showAddPin && <AddPinPage setShowAddPin={setShowAddPin} />}
    </div>
  );
}
