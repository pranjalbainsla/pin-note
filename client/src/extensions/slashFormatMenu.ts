import { Extension, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

export interface SlashFormatMenuOptions {
  onOpen: (props: {
    clientRect?: (() => DOMRect | null) | null;
    range: Range;
  }) => void;
  onClose: () => void;
}

export const slashFormatMenu = Extension.create<SlashFormatMenuOptions>({
  name: "slashFormatMenu",

  addOptions() {
    return {
      onOpen: () => {},
      onClose: () => {},
    };
  },

  addProseMirrorPlugins() {
    const { onOpen, onClose } = this.options;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        items: () => [],
        command: () => {},
        render: () => ({
          onStart: (props) => {
            onOpen({
              clientRect: props.clientRect,
              range: props.range,
            });
          },
          onExit: () => {
            onClose();
          },
        }),
      }),
    ];
  },
});
