interface EditorToolbarProps {
  isSaving: boolean;
  error: string;
}

export default function EditorToolbar({ isSaving, error }: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-end mb-10 h-9 gap-3">
      <span className="text-sm text-[#8A8A8A] font-[family-name:var(--font-ui)]">
        {isSaving ? "Saving..." : ""}
      </span>
      {error && (
        <p className="text-sm text-red-500 font-[family-name:var(--font-ui)]">{error}</p>
      )}
    </div>
  );
}
