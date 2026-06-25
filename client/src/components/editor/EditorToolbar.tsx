interface EditorToolbarProps {
  error: string;
}

export default function EditorToolbar({ error }: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-end mb-10 h-9 gap-3">
      {error && (
        <p className="text-sm text-red-500 font-[family-name:var(--font-ui)]">{error}</p>
      )}
    </div>
  );
}
