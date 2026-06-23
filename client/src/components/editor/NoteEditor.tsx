import { EditorContent as TiptapEditorContent, type Editor } from "@tiptap/react";

interface NoteEditorProps {
  editor: Editor | null;
}

export default function NoteEditor({ editor }: NoteEditorProps) {
  return <TiptapEditorContent editor={editor} />;
}
