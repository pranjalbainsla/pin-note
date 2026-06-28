import type { EditorView } from "@tiptap/pm/view";
import { COMFORTABLE_VISIBILITY_MARGIN_PX } from "./constants";

export interface CaretCoords {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ContainerCaretGeometry {
  caret: CaretCoords;
  /** Caret top relative to the container's visible top edge (px). */
  caretTopRelative: number;
  /** Caret bottom relative to the container's visible top edge (px). */
  caretBottomRelative: number;
  containerHeight: number;
}

/**
 * Read caret position from the current ProseMirror selection.
 * Returns null when coords cannot be resolved (e.g. destroyed view).
 */
export function getCaretGeometry(
  view: EditorView,
  containerRect: DOMRect,
): ContainerCaretGeometry | null {
  const { head } = view.state.selection;

  let coords: CaretCoords;
  try {
    coords = view.coordsAtPos(head);
  } catch {
    return null;
  }

  return {
    caret: coords,
    caretTopRelative: coords.top - containerRect.top,
    caretBottomRelative: coords.bottom - containerRect.top,
    containerHeight: containerRect.height,
  };
}

/**
 * True when the caret is fully inside the container viewport with margin padding.
 * Used to skip unnecessary scrolls and to resume auto-scroll after manual suspension.
 */
export function isCaretComfortablyVisible(geometry: ContainerCaretGeometry): boolean {
  const margin = COMFORTABLE_VISIBILITY_MARGIN_PX;
  const { caretTopRelative, caretBottomRelative, containerHeight } = geometry;

  return (
    caretTopRelative >= margin &&
    caretBottomRelative <= containerHeight - margin
  );
}
