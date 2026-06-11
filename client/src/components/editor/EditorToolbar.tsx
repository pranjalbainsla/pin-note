interface EditorToolbarProps {
  isSaving: boolean;
  error: string;
  showNav: boolean;
  onHome: () => void;
  onLogout: () => void;
}

export default function EditorToolbar({
  isSaving,
  error,
  showNav,
  onHome,
  onLogout,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-10 h-9">
      <div
        className={`flex items-center gap-2 transition-opacity duration-500 ease-out ${
          showNav ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={onHome}
          className="text-sm text-[#4A4A4A] hover:text-[#2D2D2D] transition-colors px-3 py-1.5 rounded-xl border border-[#E8E6E1] bg-white/60 backdrop-blur-sm shadow-sm font-[family-name:var(--font-ui)]"
        >
          Home
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[#8A8A8A] font-[family-name:var(--font-ui)]">
          {isSaving ? "Saving..." : ""}
        </span>
        {error && (
          <p className="text-sm text-red-500 font-[family-name:var(--font-ui)]">
            {error}
          </p>
        )}
      </div>

      <div
        className={`transition-opacity duration-500 ease-out ${
          showNav ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={onLogout}
          className="text-sm text-[#4A4A4A] hover:text-[#2D2D2D] transition-colors px-3 py-1.5 rounded-xl border border-[#E8E6E1] bg-white/60 backdrop-blur-sm shadow-sm font-[family-name:var(--font-ui)]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
