import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNote } from "@/hooks/useNote";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePins } from "@/hooks/usePins";
import { applyMarkdownPattern } from "@/utils/applyMarkdownPattern";
import { combineEditorErrors } from "@/utils/combineEditorErrors";
import { AUTOSAVE_DELAY_MS } from "@/constants/editor";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorContent from "@/components/editor/EditorContent";
import PinsPopup from "@/components/editor/PinsPopup";
import FloatingPin from "@/components/editor/FloatingPin";

const TYPING_IDLE_MS = 1500;
const TOP_HOVER_ZONE_RATIO = 0.15;

/**
 * Intentionally thin — wires hooks to components, owns no logic of its own.
 */
export default function Editor() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { title, setTitle, isLoading, isSaving, error: noteError, editorRef, fetchNote, saveNote } =
    useNote(noteId);
  const { scheduleAutoSave } = useAutoSave(saveNote, AUTOSAVE_DELAY_MS);
  const {
    showPinsPopup,
    popupPosition,
    closePinsPopup,
    pins,
    floatingPins,
    error: pinsError,
    openPinsPopup,
    insertPin,
    removePin,
    updatePinPosition,
  } = usePins();

  const editorError = combineEditorErrors(noteError, pinsError);

  const [isTyping, setIsTyping] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNav = !isTyping || isNearTop;

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setIsNearTop(e.clientY < window.innerHeight * TOP_HOVER_ZONE_RATIO);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const markTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, TYPING_IDLE_MS);
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    markTyping();

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode = range.startContainer as Text;
    const cursorOffset = range.startOffset;
    const textUpToCursor = (textNode.textContent ?? "").slice(0, cursorOffset);

    if (textUpToCursor.endsWith("/")) {
      const rect = range.getBoundingClientRect();
      openPinsPopup({ x: rect.left, y: rect.bottom + 6 });
    }

    applyMarkdownPattern(textNode, cursorOffset, selection);
    scheduleAutoSave();
  }, [editorRef, markTyping, openPinsPopup, scheduleAutoSave]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      markTyping();
      setTitle(e.target.value);
      scheduleAutoSave();
    },
    [markTyping, setTitle, scheduleAutoSave],
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--slate-muted)]">
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 min-h-0 overflow-auto px-6 py-10"
    >
      <div className="max-w-3xl mx-auto w-full">
        <EditorToolbar
          isSaving={isSaving}
          error={editorError}
          showNav={showNav}
          onHome={() => navigate("/home")}
          onLogout={logout}
        />

        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          disabled={!noteId}
          className="w-full text-4xl font-semibold tracking-tight text-[var(--slate-surface-text)] placeholder:text-[var(--slate-muted)] outline-none border-none mb-10 disabled:opacity-50 bg-transparent font-[family-name:var(--font-ui)]"
        />

        <EditorContent ref={editorRef} isEditable={!!noteId} onInput={handleInput} />
      </div>

      {showPinsPopup && popupPosition && (
        <PinsPopup
          pins={pins}
          position={popupPosition}
          boundsRef={containerRef}
          onClose={closePinsPopup}
          onSelect={insertPin}
        />
      )}

      {floatingPins.map((pin) => (
        <FloatingPin
          key={pin.id}
          pin={pin}
          onClose={removePin}
          onPositionChange={updatePinPosition}
        />
      ))}
    </div>
  );
}
