import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import getCleanHTML from "../utils/getCleanHTML";
import { getNoteById, updateNote } from "../services/notesService";
import { useNavigate, useParams } from "react-router-dom";
import PinCard from "../components/PinCard";
import type { Pin } from "../types";
import { getPins } from "../services/pinsService";
import { Rnd } from "react-rnd";

const ZERO_WIDTH_SPACE = "\u200B";
const AUTOSAVE_DELAY_MS = 1000; // 1 second of inactivity

const MARKDOWN_PATTERNS = [
  { regex: /\*\*([^*\n]+)\*\*$/,          tag: "strong" as const },
  { regex: /(?<!\*)\*([^*\n]+)\*(?!\*)$/, tag: "em"     as const },
  { regex: /`([^`\n]+)`$/,                tag: "code"   as const },
];

export default function Editor() {
    const { logout } = useAuth();
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);
    const { noteId } = useParams<{ noteId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    // Pin related states
    const [showPinsPopup, setShowPinsPopup] = useState(false);
    const [pins, setPins] = useState<Pin[]>([]);
    const [floatingPins, setFloatingPins] = useState<any[]>([]);

    const fetchPins = useCallback(async () => {
      try {
        const res = await getPins();
        if(!res) {
          setError("Failed to fetch pins. Please try again later.");
          return;
        }

        setPins(res.pins);

      } catch (err) {
        console.error(err);
      }

    }, []);
    const insertPinIntoEditor = (pin: any) => {

      setShowPinsPopup(false);

      const newPin = {
        ...pin,
        x: 100,
        y: 100,
        width: 320,
        height: 220,
      };

      setFloatingPins((prev) => [...prev, newPin]);
    };
  
    const fetchNote = useCallback(async () => {
      if (!noteId) return;

      try {
        setIsLoading(true);

        const response = await getNoteById(noteId);

        const note = response.note;

        setTitle(note.title);

        if (editorRef.current) {
          editorRef.current.innerHTML = note.content || "";
        }

      } catch (err) {
        setError("Failed to load note. Please try again later.");
        console.error("Failed to fetch note:", err);
      } finally {
        setIsLoading(false);
      }
    }, [noteId]);

    useEffect(() => {
      fetchNote();
    }, [fetchNote]);

    const saveNote = useCallback(async () => {
      if (!editorRef.current || !noteId) return;

      const content = getCleanHTML(editorRef.current);

      setIsSaving(true);

      try {
        await updateNote(noteId, title, content);
      } catch (err) {
        setError("Auto-save failed. Please try again.");
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    }, [noteId, title]);

    // Trigger auto-save with debounce
    const scheduleAutoSave = useCallback(() => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(
        saveNote,
        AUTOSAVE_DELAY_MS
      );
    }, [saveNote]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }, []);

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
        if (textUpToCursor.endsWith("/")) {
          setShowPinsPopup(true);
          fetchPins();
        }

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
        scheduleAutoSave();

    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      // Trigger auto-save on title change
      scheduleAutoSave();

    };
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  return (

    <div className="min-h-screen bg-white text-black px-6 py-10 font-sans">

      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <div>
            <button 
              onClick={()=>navigate('/home')}
              className="text-sm text-neutral-500 hover:text-black transition px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm"
            >
              Home
            </button>
          </div>
          <div className="text-sm text-neutral-400">
            {isSaving ? "Saving..." : ""}
          </div>
          <div>
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
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
          onChange={handleTitleChange}
          disabled={!noteId}
          className="w-full text-4xl font-semibold tracking-tight placeholder:text-neutral-300 outline-none border-none mb-10 disabled:opacity-50"
        />

        <div
          ref={editorRef}
          contentEditable={!!noteId}
          suppressContentEditableWarning
          onInput={handleInput}
          className="min-h-[500px] outline-none text-lg leading-8 text-neutral-800 text-left prose prose-neutral max-w-none"
          data-placeholder="Start writing..."
        />

      </div>
        {showPinsPopup && (

        <div
          onClick={() => setShowPinsPopup(false)}
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute
              top-24
              left-1/2
              -translate-x-1/2
              w-[1100px]
              h-[650px]
              bg-white
              rounded-3xl
              shadow-2xl
              p-8
              overflow-y-auto
            "
          >

            <div className="grid grid-cols-3 gap-6">

              {pins.map((pin: any) => (
                <PinCard
                  key={pin.id}
                  pin={pin}
                  onClick={() => insertPinIntoEditor(pin)}
                />
              ))}

            </div>

          </div>

        </div>
        )}
        {floatingPins.map((pin) => (

          <Rnd
            key={pin.id}
            default={{
              x: pin.x,
              y: pin.y,
              width: 320,
              height: 220,
            }}
            bounds="window"
            minWidth={250}
            minHeight={150}
            dragHandleClassName="pin-drag-handle"
          >

            <div
              className="
                h-full
                bg-yellow-50
                border
                border-yellow-200
                rounded-2xl
                shadow-2xl
                overflow-hidden
                flex
                flex-col
              "
            >

              {/* draggable top bar */}
              <div
                className="
                  pin-drag-handle
                  cursor-grab
                  active:cursor-grabbing
                  px-4
                  py-3
                  border-b
                  border-yellow-200
                  bg-yellow-100
                  select-none
                "
              >
                <h2 className="font-semibold text-sm">
                  {pin.title}
                </h2>
              </div>

              {/* content */}
              <div className="p-4 overflow-auto flex-1">

                <p className="text-sm text-neutral-700 text-left leading-6">
                  {pin.summary}
                </p>

              </div>

            </div>

          </Rnd>
        ))}
    </div>
  );
}
