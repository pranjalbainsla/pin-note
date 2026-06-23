import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  slashFormatMenu,
  type SlashFormatMenuOptions,
} from "@/extensions/slashFormatMenu";

export function getEditorExtensions(slashMenuOptions: SlashFormatMenuOptions) {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
    }),
    Placeholder.configure({
      placeholder: "Start writing...",
    }),
    slashFormatMenu.configure(slashMenuOptions),
  ];
}
