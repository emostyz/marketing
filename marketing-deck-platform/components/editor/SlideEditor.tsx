'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  BarChart3, 
  Image as ImageIcon, 
  Square, 
  Move,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Grid,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Slide configuration constants
const SLIDE_CONFIG = {
  width: 960,
  height: 720,
  ratio: 16/9
};

interface SlideElement {
  id: string;
  type: 'text' | 'chart' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  chartConfig?: any;
  src?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  zIndex?: number;
}

interface Slide {
  id: string;
  title: string;
  layout: 'title' | 'content' | 'comparison' | 'chart' | 'image';
  elements: SlideElement[];
  backgroundColor?: string;
  backgroundImage?: string;
}

interface SlideEditorProps {
  slide: Slide;
  onSlideUpdate: (slide: Slide) => void;
  data?: any[];
}

export function SlideEditor({ slide, onSlideUpdate, data }: SlideEditorProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'text' | 'chart' | 'image' | 'shape'>('select');
  const [history, setHistory] = useState<Slide[]>([slide]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Save to history
  const saveToHistory = useCallback((newSlide: Slide) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSlide);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Update slide and save to history
  const updateSlide = useCallback((updates: Partial<Slide>) => {
    const newSlide = { ...slide, ...updates };
    onSlideUpdate(newSlide);
    saveToHistory(newSlide);
  }, [slide, onSlideUpdate, saveToHistory]);

  // Update element
  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newElements = slide.elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateSlide({ elements: newElements });
  }, [slide.elements, updateSlide]);

  // Add new element
  const addElement = useCallback((type: SlideElement['type']) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : type === 'chart' ? 400 : 200,
      height: type === 'text' ? 60 : type === 'chart' ? 300 : 150,
      zIndex: slide.elements.length
    };

    switch (type) {
      case 'text':
        newElement.content = 'Click to edit text';
        newElement.fontSize = 18;
        newElement.fontFamily = 'Inter';
        newElement.color = '#1e293b';
        break;
      case 'chart':
        newElement.chartConfig = {
          type: 'bar',
          data: data?.slice(0, 5) || [],
          title: 'Sample Chart'
        };
        break;
      case 'image':
        newElement.src = undefined; // Will show placeholder UI
        break;
      case 'shape':
        newElement.shapeType = 'rectangle';
        newElement.backgroundColor = '#6366f1';
        break;
    }

    updateSlide({ elements: [...slide.elements, newElement] });
    setSelectedElement(newElement.id);
  }, [slide.elements, updateSlide, data]);

  // Delete element
  const deleteElement = useCallback((elementId: string) => {
    const newElements = slide.elements.filter(el => el.id !== elementId);
    updateSlide({ elements: newElements });
    setSelectedElement(null);
  }, [slide.elements, updateSlide]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onSlideUpdate(history[newIndex]);
    }
  }, [history, historyIndex, onSlideUpdate]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onSlideUpdate(history[newIndex]);
    }
  }, [history, historyIndex, onSlideUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(prev => Math.min(2, prev + 0.1));
            break;
          case '-':
            e.preventDefault();
            setZoom(prev => Math.max(0.25, prev - 0.1));
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          e.preventDefault();
          deleteElement(selectedElement);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {/* Left side tools */}
        <div className="flex items-center gap-2">
          <ToolbarButton 
            icon={Move} 
            active={tool === 'select'} 
            onClick={() => setTool('select')}
            title="Select (V)"
          />
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton 
            icon={Type} 
            onClick={() => {
              setTool('text');
              addElement('text');
            }}
            title="Add Text (T)"
          />
          <ToolbarButton 
            icon={BarChart3} 
            onClick={() => {
              setTool('chart');
              addElement('chart');
            }}
            title="Add Chart (C)"
          />
          <ToolbarButton 
            icon={ImageIcon} 
            onClick={() => {
              setTool('image');
              addElement('image');
            }}
            title="Add Image (I)"
          />
          <ToolbarButton 
            icon={Square} 
            onClick={() => {
              setTool('shape');
              addElement('shape');
            }}
            title="Add Shape (S)"
          />
        </div>

        {/* Center - Slide info */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={slide.title}
            onChange={(e) => updateSlide({ title: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-lg text-center font-medium"
            placeholder="Slide title"
          />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <ToolbarButton 
            icon={Undo} 
            onClick={undo}
            disabled={historyIndex === 0}
            title="Undo (⌘Z)"
          />
          <ToolbarButton 
            icon={Redo} 
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Redo (⌘⇧Z)"
          />
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton 
            icon={Grid} 
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          />
          <ToolbarButton 
            icon={ZoomOut} 
            onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
            title="Zoom Out"
          />
          <span className="text-sm text-gray-600 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarButton 
            icon={ZoomIn} 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            title="Zoom In"
          />
        </div>
      </div>

      {/* Main editing area */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex items-center justify-center min-h-full">
            <motion.div
              ref={canvasRef}
              className="relative bg-white shadow-2xl"
              style={{
                width: SLIDE_CONFIG.width,
                height: SLIDE_CONFIG.height,
                transformOrigin: 'center'
              }}
              animate={{ scale: zoom }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Grid overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #000 1px, transparent 1px),
                      linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Render elements */}
              <AnimatePresence>
                {slide.elements.map(element => (
                  <ElementRenderer
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    onSelect={() => setSelectedElement(element.id)}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                    onDelete={() => deleteElement(element.id)}
                    zoom={zoom}
                  />
                ))}
              </AnimatePresence>

              {/* Click to add elements */}
              {tool !== 'select' && (
                <div
                  className="absolute inset-0 cursor-crosshair"
                  onClick={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const x = (e.clientX - rect.left) / zoom;
                      const y = (e.clientY - rect.top) / zoom;
                      addElement(tool);
                      setTool('select');
                    }
                  }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Properties panel */}
        <AnimatePresence>
          {selectedElement && (
            <PropertiesPanel
              element={slide.elements.find(el => el.id === selectedElement)!}
              onUpdate={(updates) => updateElement(selectedElement, updates)}
              onClose={() => setSelectedElement(null)}
              data={data}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Toolbar Button Component
interface ToolbarButtonProps {
  icon: React.ComponentType<any>;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}

function ToolbarButton({ icon: Icon, active, disabled, onClick, title }: ToolbarButtonProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 ${active ? 'bg-indigo-100 text-indigo-700' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}

// Element Renderer Component
interface ElementRendererProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onDelete: () => void;
  zoom: number;
}

function ElementRenderer({ element, isSelected, onSelect, onUpdate, onDelete, zoom }: ElementRendererProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.x * zoom,
        y: e.clientY - element.y * zoom
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      onUpdate({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, zoom]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex || 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Element content */}
      {element.type === 'text' && (
        <TextElement element={element} onUpdate={onUpdate} />
      )}
      
      {element.type === 'chart' && (
        <ChartElement element={element} onUpdate={onUpdate} />
      )}
      
      {element.type === 'image' && (
        <ImageElement element={element} onUpdate={onUpdate} />
      )}
      
      {element.type === 'shape' && (
        <ShapeElement element={element} onUpdate={onUpdate} />
      )}

      {/* Selection handles */}
      {isSelected && (
        <>
          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se'].map(position => (
            <div
              key={position}
              className={`absolute w-3 h-3 bg-indigo-500 border border-white cursor-${position}-resize`}
              style={{
                top: position.includes('n') ? -6 : undefined,
                bottom: position.includes('s') ? -6 : undefined,
                left: position.includes('w') ? -6 : undefined,
                right: position.includes('e') ? -6 : undefined
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            />
          ))}
          
          {/* Delete button */}
          <button
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
            onClick={onDelete}
          >
            ×
          </button>
        </>
      )}
    </motion.div>
  );
}

// Text Element Component
function TextElement({ element, onUpdate }: { element: SlideElement; onUpdate: (updates: Partial<SlideElement>) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(element.content || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleBlur();
    }
  };

  return (
    <div className="w-full h-full p-2">
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full h-full resize-none border-none outline-none bg-transparent"
          style={{
            fontSize: element.fontSize || 18,
            fontFamily: element.fontFamily || 'Inter',
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            color: element.color || '#1e293b',
            textAlign: element.textAlign || 'left',
            lineHeight: element.lineHeight || 1.4
          }}
        />
      ) : (
        <div
          className="w-full h-full cursor-text"
          onDoubleClick={handleDoubleClick}
          style={{
            fontSize: element.fontSize || 18,
            fontFamily: element.fontFamily || 'Inter',
            fontWeight: element.fontWeight || 'normal',
            fontStyle: element.fontStyle || 'normal',
            color: element.color || '#1e293b',
            textAlign: element.textAlign || 'left',
            lineHeight: element.lineHeight || 1.4,
            whiteSpace: 'pre-wrap'
          }}
        >
          {element.content || 'Double-click to edit'}
        </div>
      )}
    </div>
  );
}

// Chart Element Component
function ChartElement({ element, onUpdate }: { element: SlideElement; onUpdate: (updates: Partial<SlideElement>) => void }) {
  return (
    <div className="w-full h-full bg-gray-100 border rounded flex items-center justify-center">
      <div className="text-center text-gray-600">
        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
        <div className="text-sm">Chart Placeholder</div>
        <div className="text-xs text-gray-500">Click to configure</div>
      </div>
    </div>
  );
}

// Image Element Component
function ImageElement({ element, onUpdate }: { element: SlideElement; onUpdate: (updates: Partial<SlideElement>) => void }) {
  return (
    <div className="w-full h-full bg-gray-100 border rounded flex items-center justify-center">
      {element.src ? (
        <img src={element.src} alt="" className="w-full h-full object-cover rounded" />
      ) : (
        <div className="text-center text-gray-600">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">Image Placeholder</div>
          <div className="text-xs text-gray-500">Click to upload</div>
        </div>
      )}
    </div>
  );
}

// Shape Element Component
function ShapeElement({ element, onUpdate }: { element: SlideElement; onUpdate: (updates: Partial<SlideElement>) => void }) {
  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: element.backgroundColor || '#6366f1',
    borderColor: element.borderColor || 'transparent',
    borderWidth: element.borderWidth || 0,
    borderStyle: 'solid'
  };

  switch (element.shapeType) {
    case 'circle':
      return <div style={{ ...style, borderRadius: '50%' }} />;
    case 'triangle':
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${element.width / 2}px solid transparent`,
            borderRight: `${element.width / 2}px solid transparent`,
            borderBottom: `${element.height}px solid ${element.backgroundColor || '#6366f1'}`
          }}
        />
      );
    default:
      return <div style={style} />;
  }
}

// Properties Panel Component
interface PropertiesPanelProps {
  element: SlideElement;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onClose: () => void;
  data?: any[];
}

function PropertiesPanel({ element, onUpdate, onClose, data }: PropertiesPanelProps) {
  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
      </div>

      {/* Position and Size */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Text-specific properties */}
      {element.type === 'text' && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Text Formatting</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={element.fontSize || 18}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 18 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Family</label>
              <select
                value={element.fontFamily || 'Inter'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Color</label>
              <input
                type="color"
                value={element.color || '#1e293b'}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Enhancement Button */}
      <div className="mt-6">
        <Button 
          variant="default" 
          className="w-full flex items-center gap-2"
          onClick={() => {
            // TODO: Implement AI enhancement
            console.log('AI enhance element:', element);
          }}
        >
          <Sparkles className="w-4 h-4" />
          Enhance with AI
        </Button>
      </div>
    </motion.div>
  );
}