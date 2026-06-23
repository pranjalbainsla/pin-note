import { useCallback, useState } from "react";

export interface PopupPosition {
  x: number;
  y: number;
}

export function useEditorFormatMenu() {
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const openFormatMenu = useCallback((position: PopupPosition) => {
    setPopupPosition(position);
    setShowFormatMenu(true);
  }, []);

  const closeFormatMenu = useCallback(() => {
    setShowFormatMenu(false);
    setPopupPosition(null);
  }, []);

  return {
    showFormatMenu,
    popupPosition,
    openFormatMenu,
    closeFormatMenu,
  };
}
