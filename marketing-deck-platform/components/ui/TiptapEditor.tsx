import React, { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Paragraph from '@tiptap/extension-paragraph'
import { Button } from './button'

interface TiptapEditorProps {
  content: string
  onUpdate: (html: string) => void
}

export default function TiptapEditor({ content, onUpdate }: TiptapEditorProps) {
  const [focused, setFocused] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Bold,
      Italic,
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      Paragraph,
    ],
    content,
    onUpdate: ({ editor }: { editor: any }) => onUpdate(editor.getHTML()),
  })

  if (!editor) return <textarea value={content} onChange={e => onUpdate(e.target.value)} className="w-full min-h-[120px] bg-[#23242b] text-white rounded-lg p-2 border border-[#23242b]" />

  return (
    <div className="relative">
      {focused && (
        <div className="absolute -top-12 left-0 z-10 flex gap-1 bg-[#181A20] border border-[#23242b] rounded-lg p-2 shadow-lg">
          <Button aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`px-2 py-1 ${editor.isActive('bold') ? 'bg-blue-600 text-white' : ''}`}><b>B</b></Button>
          <Button aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`px-2 py-1 ${editor.isActive('italic') ? 'bg-blue-600 text-white' : ''}`}><i>I</i></Button>
          <Button aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={`px-2 py-1 ${editor.isActive('underline') ? 'bg-blue-600 text-white' : ''}`}><u>U</u></Button>
          <Button aria-label="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : ''}`}>H2</Button>
          <Button aria-label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : ''}`}>• List</Button>
          <Button aria-label="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : ''}`}>1. List</Button>
          <Button aria-label="Link" onClick={() => { const url = window.prompt('Enter URL'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} className="px-2 py-1">🔗</Button>
          <Button aria-label="Undo" onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1">↺</Button>
          <Button aria-label="Redo" onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1">↻</Button>
        </div>
      )}
      <div onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <EditorContent editor={editor} className="w-full min-h-[120px] bg-[#23242b] text-white rounded-lg p-2 border border-[#23242b]" />
      </div>
    </div>
  )
} 