import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { NoteFontFamily } from "@/constants/editor";

export interface EditorFormatState {
  isBold: boolean;
  isItalic: boolean;
}

interface FontControls {
  fontFamily: NoteFontFamily;
  cycleFontFamily: () => void;
}

interface EditorFormatContextValue {
  formatState: EditorFormatState;
  setFormatState: Dispatch<SetStateAction<EditorFormatState>>;
  fontControls: FontControls | null;
  registerFontControls: (controls: FontControls) => void;
  unregisterFontControls: () => void;
}

const defaultState: EditorFormatState = { isBold: false, isItalic: false };

const EditorFormatContext = createContext<EditorFormatContextValue | null>(null);

export function EditorFormatProvider({ children }: { children: ReactNode }) {
  const [formatState, setFormatState] = useState<EditorFormatState>(defaultState);
  const [fontControls, setFontControls] = useState<FontControls | null>(null);

  const registerFontControls = useCallback((controls: FontControls) => {
    setFontControls(controls);
  }, []);

  const unregisterFontControls = useCallback(() => {
    setFontControls(null);
  }, []);

  const value = useMemo(
    () => ({
      formatState,
      setFormatState,
      fontControls,
      registerFontControls,
      unregisterFontControls,
    }),
    [formatState, fontControls, registerFontControls, unregisterFontControls],
  );

  return (
    <EditorFormatContext.Provider value={value}>
      {children}
    </EditorFormatContext.Provider>
  );
}

export function useEditorFormat() {
  return useContext(EditorFormatContext);
}

export function resetEditorFormatState(
  setFormatState: ((state: EditorFormatState) => void) | undefined,
) {
  setFormatState?.(defaultState);
}
