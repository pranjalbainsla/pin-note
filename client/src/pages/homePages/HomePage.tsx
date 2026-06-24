import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NEW_NOTE_ID } from "@/constants/editor";
import AddPinPage from "./AddPinPage";

export default function HomePage() {
  const navigate = useNavigate();
  const [showAddPin, setShowAddPin] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center min-h-0 overflow-hidden">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate(`/editor/${NEW_NOTE_ID}`)}
          className="px-6 py-3 bg-[var(--slate-surface-text)] text-[var(--slate-surface)] rounded-2xl shadow-[var(--slate-shadow)] hover:scale-[1.02] transition"
        >
          Create a note
        </button>

        <button
          onClick={() => setShowAddPin(true)}
          className="px-6 py-3 bg-[var(--slate-surface)]/80 border border-[var(--slate-border)] text-[var(--slate-muted)] rounded-2xl shadow-sm hover:scale-[1.02] transition backdrop-blur-sm"
        >
          Add a pin
        </button>
      </div>

      {showAddPin && (
        <>
          <div
            className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"
            onClick={() => setShowAddPin(false)}
          />
          <AddPinPage setShowAddPin={setShowAddPin} />
        </>
      )}
    </div>
  );
}
