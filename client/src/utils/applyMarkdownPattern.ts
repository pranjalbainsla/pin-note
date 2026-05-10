import { MARKDOWN_PATTERNS, ZERO_WIDTH_SPACE } from "../constants/editor";

/**
 * Pure function (no React state) — safe to unit test in isolation.
 *
 * Checks whether the text behind the cursor matches a markdown shortcut.
 * If it does, replaces the raw syntax with the appropriate inline element
 * and repositions the cursor. Returns true if a pattern was applied.
 */
export function applyMarkdownPattern(
  textNode: Text,
  cursorOffset: number,
  selection: Selection,
): boolean {
  const fullText        = textNode.textContent ?? "";
  const textUpToCursor  = fullText.slice(0, cursorOffset);
  const textAfterCursor = fullText.slice(cursorOffset);

  for (const { regex, tag } of MARKDOWN_PATTERNS) {
    const match = regex.exec(textUpToCursor);
    if (!match) continue;

    const parent = textNode.parentNode;
    if (!parent) break;

    const fragment = document.createDocumentFragment();
    const before   = textUpToCursor.slice(0, match.index);
    if (before) fragment.appendChild(document.createTextNode(before));

    const el = document.createElement(tag);
    el.textContent = match[1];
    fragment.appendChild(el);

    // Inject a ZWS when nothing follows the cursor so the browser anchors
    // the caret outside the formatted element instead of inheriting its style.
    const trailingText = textAfterCursor || ZERO_WIDTH_SPACE;
    const trailingNode = document.createTextNode(trailingText);
    fragment.appendChild(trailingNode);

    parent.replaceChild(fragment, textNode);

    const newRange = document.createRange();
    newRange.setStart(trailingNode, textAfterCursor ? 0 : 1);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    return true;
  }

  return false;
}