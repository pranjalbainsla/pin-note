import {
  BOTTOM_ZONE_RATIO,
  COMFORTABLE_BOTTOM_MARGIN_PX,
  SCROLL_EPSILON_PX,
} from "./constants";
import type { ContainerCaretGeometry } from "./caretGeometry";

export interface ScrollTarget {
  targetScrollTop: number;
  delta: number;
}

/**
 * Compute the minimum scroll delta needed to keep the caret above the bottom
 * writing zone. Returns null when the caret is already above the danger zone.
 */
export function computeScrollTarget(
  geometry: ContainerCaretGeometry,
  currentScrollTop: number,
): ScrollTarget | null {
  const zoneStart = geometry.containerHeight * (1 - BOTTOM_ZONE_RATIO);

  if (geometry.caretBottomRelative <= zoneStart) {
    return null;
  }

  const delta =
    geometry.caretBottomRelative - zoneStart + COMFORTABLE_BOTTOM_MARGIN_PX;

  if (delta < SCROLL_EPSILON_PX) {
    return null;
  }

  return {
    delta,
    targetScrollTop: currentScrollTop + delta,
  };
}
