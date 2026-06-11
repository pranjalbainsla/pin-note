import { forwardRef } from "react";

interface EditorContentProps {
  isEditable: boolean;
  onInput: () => void;
}

/**
 * forwardRef lets useNote hold the single source-of-truth ref to this DOM
 * node without any prop-drilled setter.
 */
const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ isEditable, onInput }, ref) => (
    <div
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning
      onInput={onInput}
      className="editor-canvas min-h-[500px] outline-none text-lg leading-[1.75] text-[#4A4A4A] text-left max-w-none font-[family-name:var(--font-serif)]"
      data-placeholder="Start writing..."
    />
  ),
);

EditorContent.displayName = "EditorContent";
export default EditorContent;
