import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNote } from "../../hooks/useNote";
import { useAutoSave } from "../../hooks/useAutoSave";
import { usePins } from "../../hooks/usePins";
import { applyMarkdownPattern } from "../../utils/applyMarkdownPattern";
import { AUTOSAVE_DELAY_MS } from "../../constants/editor";
import EditorToolbar from "../../components/editor/EditorToolbar";
import EditorContent from "../../components/editor/EditorContent";
import PinsPopup from "../../components/editor/PinsPopup";
import FloatingPin from "../../components/editor/FloatingPin";

/**
 * Intentionally thin — wires hooks to components, owns no logic of its own.
 */
export default function Editor() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();

  const { title, setTitle, isLoading, isSaving, error, editorRef, fetchNote, saveNote } =
    useNote(noteId);
  const { scheduleAutoSave } = useAutoSave(saveNote, AUTOSAVE_DELAY_MS);
  const { showPinsPopup, closePinsPopup, pins, floatingPins, openPinsPopup, insertPin, removePin } =
    usePins();

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode       = range.startContainer as Text;
    const cursorOffset   = range.startOffset;
    const textUpToCursor = (textNode.textContent ?? "").slice(0, cursorOffset);

    if (textUpToCursor.endsWith("/")) openPinsPopup();

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
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <EditorToolbar
          isSaving={isSaving}
          error={error}
          onHome={() => navigate("/home")}
          onLogout={logout}
        />

        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          disabled={!noteId}
          className="w-full text-4xl font-semibold tracking-tight placeholder:text-neutral-300 outline-none border-none mb-10 disabled:opacity-50"
        />

        <EditorContent ref={editorRef} isEditable={!!noteId} onInput={handleInput} />
      </div>

      {showPinsPopup && (
        <PinsPopup pins={pins} onClose={closePinsPopup} onSelect={insertPin} />
      )}

      {floatingPins.map((pin) => (
        <FloatingPin key={pin.id} pin={pin} onClose={removePin} />
      ))}
    </div>
  );
}