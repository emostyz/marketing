'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { debounce } from 'lodash'
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code,
  Palette, Link as LinkIcon, Unlink,
  Type, Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface RichTextEditorProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: { html: string; text: string }) => void
  className?: string
  style?: React.CSSProperties
  autoFocus?: boolean
  editable?: boolean
  minimal?: boolean
  fontSize?: number
  fontFamily?: string
  textColor?: string
  backgroundColor?: string
}

export function RichTextEditor({
  content = '',
  placeholder = 'Start typing...',
  onUpdate,
  className = '',
  style = {},
  autoFocus = false,
  editable = true,
  minimal = false,
  fontSize = 16,
  fontFamily = 'Inter',
  textColor = '#000000',
  backgroundColor = 'transparent'
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Debounced update function
  const debouncedUpdate = useMemo(
    () => debounce((html: string, text: string) => {
      if (onUpdate) {
        onUpdate({ html, text })
      }
    }, 300),
    [onUpdate]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle']
      }),
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:text-blue-700'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className}`,
        style: `
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          color: ${textColor};
          background-color: ${backgroundColor};
          min-height: 100%;
          padding: 8px;
        `
      }
    },
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getHTML(), editor.getText())
    },
    onFocus: () => setIsEditing(true),
    onBlur: () => setIsEditing(false)
  })

  // Update editor content when props change
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  // Toolbar action handlers
  const handleBold = () => editor?.chain().focus().toggleBold().run()
  const handleItalic = () => editor?.chain().focus().toggleItalic().run()
  const handleUnderline = () => editor?.chain().focus().toggleUnderline().run()
  const handleStrike = () => editor?.chain().focus().toggleStrike().run()
  const handleCode = () => editor?.chain().focus().toggleCode().run()

  const handleHeading = (level: number) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run()
    } else {
      editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()
    }
  }

  const handleAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(alignment).run()
  }

  const handleList = (type: 'bullet' | 'ordered') => {
    if (type === 'bullet') {
      editor?.chain().focus().toggleBulletList().run()
    } else {
      editor?.chain().focus().toggleOrderedList().run()
    }
  }

  const handleColor = (color: string) => {
    editor?.chain().focus().setColor(color).run()
    setShowColorPicker(false)
  }

  const handleHighlight = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run()
  }

  const handleLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const handleUnlink = () => {
    editor?.chain().focus().unsetLink().run()
  }

  const handleQuote = () => {
    editor?.chain().focus().toggleBlockquote().run()
  }

  const handleDivider = () => {
    editor?.chain().focus().setHorizontalRule().run()
  }

  if (!editor) {
    return <div className="w-full h-full bg-gray-50 animate-pulse" />
  }

  const ToolbarButton: React.FC<{
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    icon: React.ComponentType<{ className?: string }>
    tooltip?: string
  }> = ({ onClick, isActive, disabled, icon: Icon, tooltip }) => (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 p-0 ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </Button>
  )

  const predefinedColors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6600', '#ffcc00', '#66ff00', '#00ff66', '#00ffcc',
    '#0066ff', '#6600ff', '#cc00ff', '#ff0066'
  ]

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      {isEditing && !minimal && (
        <div className="absolute -top-12 left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1 flex-wrap">
          {/* Text Style */}
          <Select
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' : '0'
            }
            onValueChange={(value) => handleHeading(parseInt(value))}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Normal</SelectItem>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Formatting */}
          <ToolbarButton
            onClick={handleBold}
            isActive={editor.isActive('bold')}
            icon={Bold}
            tooltip="Bold (⌘B)"
          />
          <ToolbarButton
            onClick={handleItalic}
            isActive={editor.isActive('italic')}
            icon={Italic}
            tooltip="Italic (⌘I)"
          />
          <ToolbarButton
            onClick={handleUnderline}
            isActive={editor.isActive('underline')}
            icon={Underline}
            tooltip="Underline (⌘U)"
          />
          <ToolbarButton
            onClick={handleStrike}
            isActive={editor.isActive('strike')}
            icon={Strikethrough}
            tooltip="Strikethrough"
          />
          <ToolbarButton
            onClick={handleCode}
            isActive={editor.isActive('code')}
            icon={Code}
            tooltip="Code"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => handleAlignment('left')}
            isActive={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft}
            tooltip="Align Left"
          />
          <ToolbarButton
            onClick={() => handleAlignment('center')}
            isActive={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter}
            tooltip="Align Center"
          />
          <ToolbarButton
            onClick={() => handleAlignment('right')}
            isActive={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight}
            tooltip="Align Right"
          />
          <ToolbarButton
            onClick={() => handleAlignment('justify')}
            isActive={editor.isActive({ textAlign: 'justify' })}
            icon={AlignJustify}
            tooltip="Justify"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => handleList('bullet')}
            isActive={editor.isActive('bulletList')}
            icon={List}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => handleList('ordered')}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            tooltip="Numbered List"
          />
          <ToolbarButton
            onClick={handleQuote}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
            tooltip="Quote"
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Color */}
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Text Color">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid grid-cols-4 gap-1">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Link */}
          <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <PopoverTrigger asChild>
              <ToolbarButton
                onClick={() => setShowLinkDialog(true)}
                isActive={editor.isActive('link')}
                icon={LinkIcon}
                tooltip="Add Link"
              />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-3">
                <Input
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLink()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleLink} size="sm" className="flex-1">
                    Add Link
                  </Button>
                  <Button onClick={handleUnlink} variant="outline" size="sm">
                    <Unlink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarButton
            onClick={handleDivider}
            icon={Minus}
            tooltip="Horizontal Rule"
          />
        </div>
      )}

      {/* Editor Content */}
      <div 
        className={`
          w-full h-full overflow-auto rounded
          ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          ${!editable ? 'cursor-default' : 'cursor-text'}
        `}
        style={style}
        onDoubleClick={() => {
          if (editable) {
            editor.commands.focus()
          }
        }}
      >
        <EditorContent 
          editor={editor} 
          className="w-full h-full"
        />
      </div>

      {/* Placeholder when empty and not focused */}
      {!isEditing && !editor.getText() && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none"
          style={{ fontSize: `${fontSize}px`, fontFamily }}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor