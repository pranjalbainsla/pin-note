import { useEffect, useRef, type RefObject } from "react";
import type { Editor } from "@tiptap/react";
import { getCaretGeometry, isCaretComfortablyVisible } from "./writingViewport/caretGeometry";
import { applySpacer, clearSpacer, computeSpacerHeight } from "./writingViewport/spacer";
import { computeScrollTarget } from "./writingViewport/scrollController";

/**
 * Manages the writing viewport for a Tiptap editor: dynamic bottom spacer
 * and caret-aware auto-scroll. Does not modify editor state or React state.
 */
export function useWritingViewport(
  editor: Editor | null,
  containerRef: RefObject<HTMLElement | null>,
): void {
  const rafIdRef = useRef<number | null>(null);
  const isAutoScrollEnabledRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);
  const isFocusedRef = useRef(false);
  const lastSpacerHeightRef = useRef(0);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResumeCheckRef = useRef(false);
  const attachedCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!editor) return;

    let disposed = false;
    let waitRafId: number | null = null;
    let proseMirrorDom: HTMLElement | null = null;

    const clearProgrammaticScrollFlag = () => {
      if (programmaticScrollTimerRef.current !== null) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
      // Smooth scroll fires multiple scroll events; keep the flag set briefly.
      programmaticScrollTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        programmaticScrollTimerRef.current = null;
      }, 150);
    };

    const runViewportPass = () => {
      rafIdRef.current = null;

      const container = containerRef.current;
      if (!container || editor.isDestroyed) return;

      const view = editor.view;
      proseMirrorDom = view.dom;

      // --- READ PHASE (batch all DOM reads before any writes) ---
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const spacerHeight = computeSpacerHeight(containerRect.height);

      const isFocused = isFocusedRef.current && view.hasFocus();
      const geometry =
        isFocused && editor.isEditable
          ? getCaretGeometry(view, containerRect)
          : null;

      const scrollTarget =
        geometry && isAutoScrollEnabledRef.current && isFocused
          ? computeScrollTarget(geometry, scrollTop)
          : null;

      // Resume auto-scroll after manual suspension when user types with caret visible.
      if (
        pendingResumeCheckRef.current &&
        geometry &&
        isFocused &&
        isCaretComfortablyVisible(geometry)
      ) {
        isAutoScrollEnabledRef.current = true;
        pendingResumeCheckRef.current = false;
      }

      // --- WRITE PHASE ---
      applySpacer(view.dom, spacerHeight, lastSpacerHeightRef);

      if (scrollTarget) {
        isProgrammaticScrollRef.current = true;
        container.scrollTo({
          top: scrollTarget.targetScrollTop,
          behavior: "smooth",
        });
        clearProgrammaticScrollFlag();
      }
    };

    const schedulePass = () => {
      attachToContainer();
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(runViewportPass);
    };

    const onSelectionUpdate = () => {
      schedulePass();
    };

    const onUpdate = () => {
      // Typing may resume auto-scroll after manual scroll-away.
      if (!isAutoScrollEnabledRef.current && isFocusedRef.current) {
        pendingResumeCheckRef.current = true;
      }
      schedulePass();
    };

    const onFocus = () => {
      isFocusedRef.current = true;
      schedulePass();
    };

    const onBlur = () => {
      isFocusedRef.current = false;
    };

    const onContainerScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      isAutoScrollEnabledRef.current = false;
      pendingResumeCheckRef.current = false;
    };

    const attachToContainer = (): boolean => {
      if (attachedCleanupRef.current) return true;

      const container = containerRef.current;
      if (!container) return false;

      const resizeObserver = new ResizeObserver(() => {
        schedulePass();
      });
      resizeObserver.observe(container);
      container.addEventListener("scroll", onContainerScroll, { passive: true });

      attachedCleanupRef.current = () => {
        container.removeEventListener("scroll", onContainerScroll);
        resizeObserver.disconnect();
        attachedCleanupRef.current = null;
      };

      schedulePass();
      return true;
    };

    const waitForContainer = () => {
      if (disposed || attachToContainer()) return;
      waitRafId = requestAnimationFrame(waitForContainer);
    };

    editor.on("selectionUpdate", onSelectionUpdate);
    editor.on("update", onUpdate);
    editor.on("focus", onFocus);
    editor.on("blur", onBlur);

    waitForContainer();

    return () => {
      disposed = true;

      if (waitRafId !== null) {
        cancelAnimationFrame(waitRafId);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (programmaticScrollTimerRef.current !== null) {
        clearTimeout(programmaticScrollTimerRef.current);
        programmaticScrollTimerRef.current = null;
      }

      editor.off("selectionUpdate", onSelectionUpdate);
      editor.off("update", onUpdate);
      editor.off("focus", onFocus);
      editor.off("blur", onBlur);
      attachedCleanupRef.current?.();

      clearSpacer(proseMirrorDom ?? editor.view.dom, lastSpacerHeightRef);
      isAutoScrollEnabledRef.current = true;
      isProgrammaticScrollRef.current = false;
      isFocusedRef.current = false;
      pendingResumeCheckRef.current = false;
    };
  }, [editor, containerRef]);
}
