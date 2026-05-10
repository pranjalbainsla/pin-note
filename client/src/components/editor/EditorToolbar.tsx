interface EditorToolbarProps {
  isSaving: boolean;
  error: string;
  onHome: () => void;
  onLogout: () => void;
}

export default function EditorToolbar({ isSaving, error, onHome, onLogout }: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-10">
      <button
        onClick={onHome}
        className="text-sm text-neutral-500 hover:text-black transition px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm"
      >
        Home
      </button>

      <span className="text-sm text-neutral-400">
        {isSaving ? "Saving..." : ""}
      </span>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={onLogout}
        className="text-sm text-neutral-500 hover:text-black transition px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm"
      >
        Logout
      </button>
    </div>
  );
}