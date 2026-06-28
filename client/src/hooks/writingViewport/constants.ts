/** Fraction of container height treated as the bottom "danger zone" for auto-scroll. */
export const BOTTOM_ZONE_RATIO = 0.15;

/** Target vertical position for the last line when scrolled to the end (fraction of container). */
export const CENTER_TARGET_RATIO = 0.5;

/** Minimum space kept below the caret when auto-scrolling (px). */
export const COMFORTABLE_BOTTOM_MARGIN_PX = 80;

/** Padding around caret edges when deciding if it is already comfortably visible (px). */
export const COMFORTABLE_VISIBILITY_MARGIN_PX = 16;

/** Minimum scroll delta before issuing a scrollTo call (px). */
export const SCROLL_EPSILON_PX = 1;
