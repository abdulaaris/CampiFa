import React from 'react';
import {
  MousePointer,
  Image as ImageIcon,
  Type,
  Square,
  Trash2,
  Copy,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Magnet,
  Eye,
  Save,
  CheckCircle,
} from 'lucide-react';

interface ToolBarProps {
  onAddPhotoArea: () => void;
  onAddTextArea: () => void;
  onAddShape: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitCanvas: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish?: () => void;
  isSaving: boolean;
  isPublished?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onAddPhotoArea,
  onAddTextArea,
  onAddShape,
  onDeleteSelected,
  onDuplicateSelected,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelection,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitCanvas,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  onPreview,
  onSave,
  onPublish,
  isSaving,
  isPublished = false,
}) => {
  return (
    <div className="bg-white border-b border-brand-border/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Element Insertion Tools */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          onClick={onAddPhotoArea}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-light text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-all shadow-2xs"
          title="Add Draggable / Resizable Photo Area Placeholder"
        >
          <ImageIcon className="w-4 h-4 text-brand-primary" />
          <span>+ Photo Area</span>
        </button>

        <button
          onClick={onAddTextArea}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-light text-brand-primary font-bold text-xs rounded-xl hover:bg-brand-light/80 border border-brand-secondary/30 transition-all shadow-2xs"
          title="Add Dynamic Text Area connected to Name/Designation/Custom field"
        >
          <Type className="w-4 h-4 text-brand-primary" />
          <span>+ Text Area</span>
        </button>

        <button
          onClick={onAddShape}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-white text-brand-dark font-semibold text-xs rounded-xl hover:bg-brand-light border border-brand-border/80 transition-all"
          title="Add Decorative Shape Badge"
        >
          <Square className="w-4 h-4 text-brand-secondary" />
          <span>+ Shape</span>
        </button>

        <div className="h-5 w-px bg-brand-border/60 mx-1 hidden sm:block" />

        {/* Edit Operations */}
        <button
          onClick={onDuplicateSelected}
          disabled={!hasSelection}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            hasSelection
              ? 'text-brand-dark hover:bg-brand-light'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Duplicate Selected Element"
        >
          <Copy className="w-4 h-4" />
        </button>

        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            hasSelection
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Delete Selected Element"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-brand-border/60 mx-1 hidden sm:block" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            canUndo ? 'text-brand-dark hover:bg-brand-light' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            canRedo ? 'text-brand-dark hover:bg-brand-light' : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Canvas View Helpers */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            showGrid ? 'bg-brand-primary text-white' : 'text-brand-dark/70 hover:bg-brand-light'
          }`}
          title="Toggle Grid Guide"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSnap}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            snapToGrid ? 'bg-brand-primary text-white' : 'text-brand-dark/70 hover:bg-brand-light'
          }`}
          title="Toggle Snap to Grid (20px)"
        >
          <Magnet className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-brand-border/60 mx-1" />

        <button
          onClick={onZoomOut}
          className="p-1.5 text-brand-dark/70 hover:bg-brand-light rounded-lg text-xs transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-semibold text-brand-dark px-1.5 min-w-[45px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="p-1.5 text-brand-dark/70 hover:bg-brand-light rounded-lg text-xs transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onFitCanvas}
          className="p-1.5 text-brand-dark/70 hover:bg-brand-light rounded-lg text-xs transition-colors hidden sm:block"
          title="Fit Canvas to Window"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Preview & Save & Publish Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPreview}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-brand-dark border border-brand-border/80 rounded-xl text-xs font-bold hover:bg-brand-light transition-all shadow-2xs"
          title="Simulate User Live Personalization"
        >
          <Eye className="w-3.5 h-3.5 text-brand-secondary" />
          <span>Preview</span>
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-4 py-1.5 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
        </button>

        {onPublish && !isPublished && (
          <button
            onClick={onPublish}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        )}
      </div>
    </div>
  );
};
