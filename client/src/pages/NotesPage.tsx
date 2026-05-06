import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ZERO_WIDTH_SPACE = "\u200B";

const MARKDOWN_PATTERNS = [
  { regex: /\*\*([^*\n]+)\*\*$/,          tag: "strong" as const },
  { regex: /(?<!\*)\*([^*\n]+)\*(?!\*)$/, tag: "em"     as const },
  { regex: /`([^`\n]+)`$/,                tag: "code"   as const },
];

export default function NotesPage() {
  const { logout } = useAuth();
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode     = range.startContainer as Text;
    const cursorOffset = range.startOffset;
    const fullText     = textNode.textContent ?? "";

    const textUpToCursor  = fullText.slice(0, cursorOffset);
    const textAfterCursor = fullText.slice(cursorOffset);

    for (const { regex, tag } of MARKDOWN_PATTERNS) {
      const match = regex.exec(textUpToCursor);
      if (!match) continue;

      const before = textUpToCursor.slice(0, match.index);
      const inner  = match[1];
      const parent = textNode.parentNode;
      if (!parent) break;

      const fragment = document.createDocumentFragment();
      if (before) fragment.appendChild(document.createTextNode(before));

      const el = document.createElement(tag);
      el.textContent = inner;
      fragment.appendChild(el);

      // If nothing follows the cursor, inject a ZWS so the browser has a
      // non-formatted character to anchor to. Without this, typing after
      // the element inherits its style (bold, italic, etc.).
      const trailingText = textAfterCursor || ZERO_WIDTH_SPACE;
      const trailingNode = document.createTextNode(trailingText);
      fragment.appendChild(trailingNode);

      parent.replaceChild(fragment, textNode);

      const newRange = document.createRange();
      // Place cursor after the ZWS (offset 1), or at 0 if real text exists.
      newRange.setStart(trailingNode, textAfterCursor ? 0 : 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      break;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10 font-sans">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div />
          <button
            onClick={logout}
            className="text-sm text-neutral-500 hover:text-black transition px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm"
          >
            Logout
          </button>
        </div>

        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-semibold tracking-tight placeholder:text-neutral-300 outline-none border-none mb-10"
        />

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="min-h-[500px] outline-none text-lg leading-8 text-neutral-800 text-left prose prose-neutral max-w-none"
          data-placeholder="Start writing..."
        />

      </div>
    </div>
  );
}