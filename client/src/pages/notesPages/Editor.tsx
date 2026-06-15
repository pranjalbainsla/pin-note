import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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

/**
 * Intentionally thin — wires hooks to components, owns no logic of its own.
 */
export default function Editor() {
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

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

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
  }, [editorRef, openPinsPopup, scheduleAutoSave]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      scheduleAutoSave();
    },
    [setTitle, scheduleAutoSave],
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
        <EditorToolbar isSaving={isSaving} error={editorError} />

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
