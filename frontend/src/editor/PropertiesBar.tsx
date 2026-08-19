import React from 'react';
import { TemplateElement, CampaignField } from '../types';
import {
  Sliders,
  Type,
  Image as ImageIcon,
  Square,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Layers,
  Settings2,
  X,
} from 'lucide-react';

interface PropertiesBarProps {
  selectedElement: TemplateElement | null;
  elements: TemplateElement[];
  fields: CampaignField[];
  onUpdateSelected: (updates: Partial<TemplateElement>) => void;
  onSelectElement: (id: string | null) => void;
  onOpenFieldManager: () => void;
  canvasDimensions: { width: number; height: number };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const PropertiesBar: React.FC<PropertiesBarProps> = ({
  selectedElement,
  elements,
  fields,
  onUpdateSelected,
  onSelectElement,
  onOpenFieldManager,
  canvasDimensions,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const styles: any = selectedElement
    ? typeof selectedElement.stylesJson === 'string'
      ? JSON.parse(selectedElement.stylesJson || '{}')
      : selectedElement.styles || {}
    : {};

  const updateStyle = (key: string, value: any) => {
    const updatedStyles = { ...styles, [key]: value };
    onUpdateSelected({
      stylesJson: JSON.stringify(updatedStyles),
    });
  };

  const fontOptions = [
    { label: 'Poppins (Modern Sans)', value: 'Poppins, sans-serif' },
    { label: 'Inter (Clean Sans)', value: 'Inter, sans-serif' },
    { label: 'Montserrat (Bold Clean)', value: 'Montserrat, sans-serif' },
    { label: 'Cinzel (Royal Serif)', value: 'Cinzel, Georgia, serif' },
    { label: 'Playfair (Classic Display)', value: 'Playfair Display, serif' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static bottom-0 left-0 right-0 z-50 lg:z-auto w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-brand-border/60 flex flex-col max-h-[80vh] lg:max-h-full lg:h-full overflow-y-auto shadow-elevated lg:shadow-none transition-transform duration-300 ease-in-out rounded-t-3xl lg:rounded-none ${
          isMobileOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-brand-border/40 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-primary" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-dark">
              {selectedElement ? `${selectedElement.type} Properties` : 'Poster & Layers'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenFieldManager}
              className="flex items-center space-x-1 px-2.5 py-1 bg-brand-light text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-light/80 transition-colors"
              title="Configure Dynamic Campaign Fields"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Fields</span>
            </button>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-brand-muted hover:text-brand-dark rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-5 text-xs pb-12 lg:pb-4">
          {selectedElement ? (
            <>
              {/* 1. Mapped Field Selection */}
              <div className="space-y-1.5 p-3 bg-brand-light/40 border border-brand-secondary/20 rounded-xl">
                <label className="font-bold text-brand-primary block">
                  Connect to Dynamic Field
                </label>
                <select
                  value={selectedElement.fieldId || ''}
                  onChange={(e) => onUpdateSelected({ fieldId: e.target.value || null })}
                  className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-hidden"
                >
                  <option value="">-- No Field (Static) --</option>
                  {fields
                    .filter((f) => (selectedElement.type === 'PHOTO' ? f.type === 'photo' : f.type !== 'photo'))
                    .map((f) => (
                      <option key={f.name} value={f.name}>
                        {`{{${f.name}}}`} — {f.label}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-brand-muted">
                  {selectedElement.type === 'PHOTO'
                    ? 'User uploaded photo will render inside this area.'
                    : 'User entered text will render with configured styles.'}
                </p>
              </div>

              {/* 2. Position & Size */}
              <div className="space-y-2">
                <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px]">
                  Dimensions &amp; Position
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-brand-muted text-[10px] block">X (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => onUpdateSelected({ x: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-brand-muted text-[10px] block">Y (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => onUpdateSelected({ y: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-brand-muted text-[10px] block">Width (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => onUpdateSelected({ width: Math.max(20, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-brand-muted text-[10px] block">Height (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => onUpdateSelected({ height: Math.max(20, Number(e.target.value)) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Photo-Specific Styles */}
              {selectedElement.type === 'PHOTO' && (
                <div className="space-y-3 pt-2 border-t border-brand-border/40">
                  <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px]">
                    Photo Area Styling
                  </span>

                  {/* Shape Selector */}
                  <div>
                    <label className="text-brand-muted text-[10px] block mb-1">Shape</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'circle', label: 'Circle' },
                        { id: 'rounded', label: 'Rounded' },
                        { id: 'rectangle', label: 'Rectangle' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => updateStyle('shape', s.id)}
                          className={`py-1.5 px-2 rounded-lg font-semibold text-xs border text-center transition-all ${
                            (styles.shape || 'circle') === s.id
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : 'bg-white text-brand-dark border-brand-border/80 hover:bg-brand-light'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width & Color */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-brand-muted text-[10px] block">Border (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={styles.borderWidth || 0}
                        onChange={(e) => updateStyle('borderWidth', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-brand-muted text-[10px] block">Border Color</label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={styles.borderColor || '#ffffff'}
                          onChange={(e) => updateStyle('borderColor', e.target.value)}
                          className="w-7 h-7 p-0 border border-brand-border/80 rounded-md cursor-pointer"
                        />
                        <input
                          type="text"
                          value={styles.borderColor || '#ffffff'}
                          onChange={(e) => updateStyle('borderColor', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Text-Specific Styles */}
              {selectedElement.type === 'TEXT' && (
                <div className="space-y-3 pt-2 border-t border-brand-border/40">
                  <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px]">
                    Text Typography
                  </span>

                  {/* Font Family */}
                  <div>
                    <label className="text-brand-muted text-[10px] block mb-1">Font Family</label>
                    <select
                      value={styles.fontFamily || 'Poppins, sans-serif'}
                      onChange={(e) => updateStyle('fontFamily', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-medium"
                    >
                      {fontOptions.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-brand-muted text-[10px] block">Font Size (px)</label>
                      <input
                        type="number"
                        min="12"
                        max="140"
                        value={styles.fontSize || 36}
                        onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-brand-muted text-[10px] block">Font Weight</label>
                      <select
                        value={styles.fontWeight || 'bold'}
                        onChange={(e) => updateStyle('fontWeight', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-medium"
                      >
                        <option value="normal">Normal (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">SemiBold (600)</option>
                        <option value="bold">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                      </select>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="text-brand-muted text-[10px] block mb-1">Alignment</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => updateStyle('textAlign', align)}
                          className={`py-1 px-2 rounded-lg font-semibold text-xs border uppercase text-center transition-all ${
                            (styles.textAlign || 'left') === align
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : 'bg-white text-brand-dark border-brand-border/80 hover:bg-brand-light'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-brand-muted text-[10px] block">Text Color</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={styles.color || '#242424'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="w-8 h-8 p-0 border border-brand-border/80 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={styles.color || '#242424'}
                        onChange={(e) => updateStyle('color', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Lock & Visibility */}
              <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between">
                <button
                  onClick={() => onUpdateSelected({ locked: !selectedElement.locked })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-brand-border/80 text-brand-dark hover:bg-brand-light"
                >
                  {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{selectedElement.locked ? 'Unlock' : 'Lock'}</span>
                </button>

                <button
                  onClick={() => onUpdateSelected({ visible: !selectedElement.visible })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-brand-border/80 text-brand-dark hover:bg-brand-light"
                >
                  {selectedElement.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{selectedElement.visible ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Empty Selection State: Display Layer List & Canvas Info */
            <div className="space-y-4">
              <div className="p-3 bg-brand-light/50 border border-brand-secondary/20 rounded-xl">
                <h4 className="font-bold text-brand-primary text-xs">Ready-Made Poster Base</h4>
                <p className="text-[11px] text-brand-dark/70 mt-1">
                  Dimensions: {canvasDimensions.width} &times; {canvasDimensions.height} px
                </p>
                <p className="text-[10px] text-brand-muted mt-0.5">
                  The original poster remains completely unchanged as Layer 0.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Configured Elements</span>
                  </span>
                  <span className="text-[10px] text-brand-muted">{elements.length} layers</span>
                </div>

                {elements.length === 0 ? (
                  <div className="p-4 border border-dashed border-brand-border text-center rounded-xl text-brand-muted text-xs">
                    No personalization areas added yet. Click &quot;+ Photo Area&quot; or &quot;+ Text Area&quot; below.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {elements.map((el, index) => (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el.id)}
                        className="p-2 bg-white border border-brand-border/70 rounded-lg hover:border-brand-primary/50 hover:bg-brand-light/30 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {el.type === 'PHOTO' && <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />}
                          {el.type === 'TEXT' && <Type className="w-3.5 h-3.5 text-brand-secondary" />}
                          {el.type === 'SHAPE' && <Square className="w-3.5 h-3.5 text-amber-600" />}
                          <span className="font-medium text-xs text-brand-dark">
                            {el.fieldId ? `{{${el.fieldId}}}` : `${el.type} #${index + 1}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-muted">
                          z: {el.zIndex || index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
