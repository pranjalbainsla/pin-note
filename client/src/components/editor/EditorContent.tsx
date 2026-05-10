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
      className="min-h-[500px] outline-none text-lg leading-8 text-neutral-800 text-left prose prose-neutral max-w-none"
      data-placeholder="Start writing..."
    />
  ),
);

EditorContent.displayName = "EditorContent";
export default EditorContent;