import { CENTER_TARGET_RATIO, COMFORTABLE_BOTTOM_MARGIN_PX } from "./constants";

/**
 * Height of bottom padding that lets the final line scroll to roughly
 * the vertical center of the viewport.
 */
export function computeSpacerHeight(containerClientHeight: number): number {
  return Math.max(
    0,
    containerClientHeight * CENTER_TARGET_RATIO - COMFORTABLE_BOTTOM_MARGIN_PX,
  );
}

/** Apply spacer as padding-bottom on the ProseMirror root; no-op if unchanged. */
export function applySpacer(dom: HTMLElement, heightPx: number, lastHeightRef: { current: number }): void {
  const rounded = Math.round(heightPx);
  if (rounded === lastHeightRef.current) return;
  lastHeightRef.current = rounded;
  dom.style.paddingBottom = `${rounded}px`;
}

/** Remove spacer padding applied by this hook. */
export function clearSpacer(dom: HTMLElement | null, lastHeightRef: { current: number }): void {
  if (!dom) return;
  dom.style.paddingBottom = "";
  lastHeightRef.current = 0;
}
