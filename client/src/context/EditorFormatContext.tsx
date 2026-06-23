import { createContext, useContext, type ReactNode, useState } from "react";

export interface EditorFormatState {
  isBold: boolean;
  isItalic: boolean;
}

interface EditorFormatContextValue {
  formatState: EditorFormatState;
  setFormatState: (state: EditorFormatState) => void;
}

const defaultState: EditorFormatState = { isBold: false, isItalic: false };

const EditorFormatContext = createContext<EditorFormatContextValue | null>(null);

export function EditorFormatProvider({ children }: { children: ReactNode }) {
  const [formatState, setFormatState] = useState<EditorFormatState>(defaultState);

  return (
    <EditorFormatContext.Provider value={{ formatState, setFormatState }}>
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
