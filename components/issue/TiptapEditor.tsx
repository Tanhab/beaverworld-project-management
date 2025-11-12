"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
  minHeight?: string; // Allow customizable min-height
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write your description here...",
  error,
  minHeight = "min-h-[200px]", // Default to larger for create/edit forms
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${minHeight} px-4 py-3 text-[hsl(var(--foreground))] prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    disabled,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded hover:bg-[hsl(var(--muted))] transition-colors",
        isActive && "bg-[hsl(var(--muted))] text-[hsl(var(--primary))]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 rounded-lg overflow-hidden bg-[hsl(var(--card))]",
          error ? "border-red-500" : "border-[hsl(var(--border))]"
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-wrap">
          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

          {/* Block elements */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}