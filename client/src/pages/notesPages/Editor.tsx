import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import type { Range } from "@tiptap/core";
import { useNote } from "@/hooks/useNote";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEditorFormatMenu } from "@/hooks/useEditorFormatMenu";
import {
  resetEditorFormatState,
  useEditorFormat,
} from "@/context/EditorFormatContext";
import { AUTOSAVE_DELAY_MS, FONT_SIZE_STEP_PX } from "@/constants/editor";
import { getEditorExtensions } from "@/lib/editorExtensions";
import EditorToolbar from "@/components/editor/EditorToolbar";
import NoteEditor from "@/components/editor/NoteEditor";
import EditorFormatMenu from "@/components/editor/EditorFormatMenu";

const EDITOR_CLASS =
  "editor-canvas min-h-[500px] outline-none leading-[1.5] text-left max-w-none font-[family-name:var(--font-serif)]";

/**
 * Intentionally thin — wires hooks to components, owns no logic of its own.
 */
export default function Editor() {
  const { noteId } = useParams<{ noteId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRangeRef = useRef<Range | null>(null);
  const scheduleAutoSaveRef = useRef<() => void>(() => {});

  const editorFormat = useEditorFormat();
  const {
    showFormatMenu,
    popupPosition,
    openFormatMenu,
    closeFormatMenu,
  } = useEditorFormatMenu();

  const openFormatMenuRef = useRef(openFormatMenu);
  const closeFormatMenuRef = useRef(closeFormatMenu);

  useEffect(() => {
    openFormatMenuRef.current = openFormatMenu;
  }, [openFormatMenu]);

  useEffect(() => {
    closeFormatMenuRef.current = closeFormatMenu;
  }, [closeFormatMenu]);

  const dismissFormatMenu = useCallback(() => {
    closeFormatMenuRef.current();
  }, []);

  const clearSlashTrigger = useCallback((editorInstance: TiptapEditor) => {
    if (suggestionRangeRef.current) {
      editorInstance.chain().focus().deleteRange(suggestionRangeRef.current).run();
      suggestionRangeRef.current = null;
    }
  }, []);

  const extensions = useMemo(
    () =>
      getEditorExtensions({
        onOpen: ({ clientRect, range }) => {
          suggestionRangeRef.current = range;
          const rect = clientRect?.();
          if (rect) {
            openFormatMenuRef.current({ x: rect.left, y: rect.bottom + 6 });
          }
        },
        onClose: () => {
          suggestionRangeRef.current = null;
          closeFormatMenuRef.current();
        },
      }),
    [],
  );

  const editor = useEditor({
    extensions,
    editable: !!noteId,
    editorProps: {
      attributes: {
        class: EDITOR_CLASS,
      },
    },
    onUpdate: () => scheduleAutoSaveRef.current(),
  });

  const {
    title,
    setTitle,
    fontSizePx,
    isLoading,
    isSaving,
    error: noteError,
    fetchNote,
    saveNote,
    saveFontSize,
  } = useNote(noteId, editor);
  const { scheduleAutoSave, flushAutoSave } = useAutoSave(saveNote, AUTOSAVE_DELAY_MS);

  useEffect(() => {
    scheduleAutoSaveRef.current = scheduleAutoSave;
  }, [scheduleAutoSave]);

  useEffect(() => {
    return () => {
      flushAutoSave();
    };
  }, [flushAutoSave]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!!noteId && !isLoading);
    }
  }, [editor, noteId, isLoading]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    if (!editor || !editorFormat) return;

    const syncFormatState = () => {
      const isBold = editor.isActive("bold");
      const isItalic = editor.isActive("italic");
      editorFormat.setFormatState((prev) =>
        prev.isBold === isBold && prev.isItalic === isItalic
          ? prev
          : { isBold, isItalic },
      );
    };

    syncFormatState();
    editor.on("selectionUpdate", syncFormatState);

    return () => {
      editor.off("selectionUpdate", syncFormatState);
      resetEditorFormatState(editorFormat.setFormatState);
    };
  }, [editor, editorFormat]);

  const handleCloseFormatMenu = useCallback(() => {
    if (editor) clearSlashTrigger(editor);
    dismissFormatMenu();
  }, [editor, clearSlashTrigger, dismissFormatMenu]);

  const handleDecreaseFontSize = useCallback(() => {
    void saveFontSize(fontSizePx - FONT_SIZE_STEP_PX);
  }, [fontSizePx, saveFontSize]);

  const handleIncreaseFontSize = useCallback(() => {
    void saveFontSize(fontSizePx + FONT_SIZE_STEP_PX);
  }, [fontSizePx, saveFontSize]);

  const handleToggleBold = useCallback(() => {
    if (!editor) return;
    clearSlashTrigger(editor);
    editor.chain().focus().toggleBold().run();
    dismissFormatMenu();
  }, [editor, clearSlashTrigger, dismissFormatMenu]);

  const handleToggleItalic = useCallback(() => {
    if (!editor) return;
    clearSlashTrigger(editor);
    editor.chain().focus().toggleItalic().run();
    dismissFormatMenu();
  }, [editor, clearSlashTrigger, dismissFormatMenu]);

  const handleExitBoldItalic = useCallback(() => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (editor.isActive("bold")) chain.unsetBold();
    if (editor.isActive("italic")) chain.unsetItalic();
    chain.run();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.key !== "c") return;
      if (!editor.isActive("bold") && !editor.isActive("italic")) return;
      e.preventDefault();
      handleExitBoldItalic();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, handleExitBoldItalic]);

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
        <EditorToolbar isSaving={isSaving} error={noteError} />

        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={handleTitleChange}
          disabled={!noteId}
          className="w-full text-4xl font-semibold tracking-tight text-[var(--slate-surface-text)] placeholder:text-[var(--slate-muted)] outline-none border-none mb-10 disabled:opacity-50 bg-transparent font-[family-name:var(--font-ui)]"
        />

        <div
          className="editor-font-wrapper"
          style={{ fontSize: `${fontSizePx}px` }}
        >
          <NoteEditor editor={editor} />
        </div>
      </div>

      {showFormatMenu && popupPosition && editor && (
        <EditorFormatMenu
          editor={editor}
          position={popupPosition}
          boundsRef={containerRef}
          fontSizePx={fontSizePx}
          onClose={handleCloseFormatMenu}
          onDecreaseFontSize={handleDecreaseFontSize}
          onIncreaseFontSize={handleIncreaseFontSize}
          onToggleBold={handleToggleBold}
          onToggleItalic={handleToggleItalic}
        />
      )}
    </div>
  );
}
