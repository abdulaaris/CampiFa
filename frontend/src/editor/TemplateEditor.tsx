import React, { useState, useEffect, useCallback } from 'react';
import { Campaign, CampaignTemplate, TemplateElement, CampaignField, FileAsset } from '../types';
import { ToolBar } from './ToolBar';
import { PropertiesBar } from './PropertiesBar';
import { InteractiveCanvas } from '../canvas/InteractiveCanvas';
import { FieldManagerModal } from './FieldManagerModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { templateService } from '../services/templateService';
import { campaignService } from '../services/campaignService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Image as ImageIcon,
  Type,
  Sliders,
  Layers,
  Eye,
  Save,
  CheckCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TemplateEditorProps {
  campaignId: string;
  onBack?: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ campaignId, onBack }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [posterFile, setPosterFile] = useState<FileAsset | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [fields, setFields] = useState<CampaignField[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Mobile drawer state - strictly controlled by user actions, NEVER auto-opens on canvas touches
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<TemplateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Calculate responsive default zoom
  const calculateDefaultZoom = () => {
    if (typeof window === 'undefined') return 0.55;
    const w = window.innerWidth;
    if (w < 480) return 0.30;
    if (w < 768) return 0.38;
    if (w < 1024) return 0.45;
    return 0.55;
  };

  const [zoom, setZoom] = useState<number>(calculateDefaultZoom());
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Modals & Feedback
  const [showFieldModal, setShowFieldModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Push state to history
  const pushHistory = useCallback(
    (newElements: TemplateElement[]) => {
      const nextHistory = history.slice(0, historyIndex + 1);
      setHistory([...nextHistory, newElements]);
      setHistoryIndex(nextHistory.length);
    },
    [history, historyIndex]
  );

  // Load template from API
  const loadData = async () => {
    try {
      setLoading(true);
      const res: any = await templateService.getTemplate(campaignId);
      const payload = res?.data || res || {};

      const camp =
        payload.campaign ||
        (await campaignService.getCampaignById(campaignId).catch(() => null)) || {
          id: campaignId,
          title: 'Campaign',
          slug: `campaign-${campaignId}`,
          status: 'DRAFT',
        };

      setCampaign(camp);
      setPosterFile(payload.posterFile || camp.posterFile || null);
      setFields(payload.fields || camp.fields || []);

      const tmpl = payload.template || {};
      const initialElems = (tmpl.elements || []).map((el: any) => ({
        ...el,
        styles: typeof el.stylesJson === 'string' ? JSON.parse(el.stylesJson || '{}') : el.styles || {},
      }));

      setElements(initialElems);
      setHistory([initialElems]);
      setHistoryIndex(0);
    } catch (err: any) {
      showToast(err.message || 'Failed to load template data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  // Adjust zoom on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setZoom(calculateDefaultZoom());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Element selection handler - canvas selection NEVER opens mobile drawer
  const handleSelectElement = (id: string | null) => {
    setSelectedElementId(id);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setElements(history[newIdx]);
    }
  };

  // Element Actions
  const handleAddPhotoArea = () => {
    const newId = `elem_${Date.now()}`;
    const newElem: TemplateElement = {
      id: newId,
      type: 'PHOTO',
      fieldId: 'photo',
      x: 390,
      y: 720,
      width: 300,
      height: 300,
      rotation: 0,
      zIndex: elements.length + 1,
      visible: true,
      locked: false,
      stylesJson: JSON.stringify({
        shape: 'circle',
        borderWidth: 6,
        borderColor: '#ffffff',
        shadow: true,
      }),
    };
    const updated = [...elements, newElem];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newId);
    showToast('Photo Area added.');
  };

  const handleAddTextArea = () => {
    const newId = `elem_${Date.now()}`;
    const newElem: TemplateElement = {
      id: newId,
      type: 'TEXT',
      fieldId: 'name',
      x: 340,
      y: 1040,
      width: 400,
      height: 60,
      rotation: 0,
      zIndex: elements.length + 1,
      visible: true,
      locked: false,
      stylesJson: JSON.stringify({
        fontFamily: 'Poppins, sans-serif',
        fontSize: 42,
        fontWeight: 'bold',
        color: '#7B2525',
        textAlign: 'center',
      }),
    };
    const updated = [...elements, newElem];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newId);
    showToast('Text Area added.');
  };

  const handleAddShape = () => {
    const newId = `elem_${Date.now()}`;
    const newElem: TemplateElement = {
      id: newId,
      type: 'SHAPE',
      fieldId: null,
      x: 80,
      y: 650,
      width: 920,
      height: 560,
      rotation: 0,
      zIndex: 1,
      visible: true,
      locked: false,
      stylesJson: JSON.stringify({
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 24,
      }),
    };
    const updated = [newElem, ...elements];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newId);
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(null);
    setIsMobileDrawerOpen(false);
    showToast('Element deleted.');
  };

  const handleDuplicateSelected = () => {
    const target = elements.find((el) => el.id === selectedElementId);
    if (!target) return;
    const newId = `elem_${Date.now()}`;
    const duplicated: TemplateElement = {
      ...target,
      id: newId,
      x: target.x + 20,
      y: target.y + 20,
      zIndex: elements.length + 1,
    };
    const updated = [...elements, duplicated];
    setElements(updated);
    pushHistory(updated);
    setSelectedElementId(newId);
    showToast('Element duplicated.');
  };

  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    const updated = elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
    setElements(updated);
  };

  // Save template to server
  const handleSave = async () => {
    try {
      setSaving(true);
      await templateService.updateTemplate(campaignId, {
        elements: elements.map((el, idx) => ({
          type: el.type,
          fieldId: el.fieldId || null,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation || 0,
          zIndex: idx + 1,
          visible: el.visible !== undefined ? el.visible : true,
          locked: el.locked !== undefined ? el.locked : false,
          stylesJson: typeof el.stylesJson === 'string' ? el.stylesJson : JSON.stringify(el.styles || {}),
        })),
        fields,
      });
      showToast('Template saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Publish campaign after validation
  const handlePublish = async () => {
    try {
      setSaving(true);
      const validation = await templateService.validateTemplate(campaignId);
      if (!validation.isValid) {
        showToast(validation.errors.join('; '), 'error');
        return;
      }

      await campaignService.publishCampaign(campaignId);
      showToast('Campaign published successfully! It is now live.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish campaign', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Poster Template Editor..." />
      </div>
    );
  }

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;
  const posterUrl = posterFile?.url || '';

  return (
    <div className="flex flex-col h-[calc(100dvh-5.5rem)] bg-white rounded-2xl border border-brand-border/60 shadow-card overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:w-auto z-50 px-4 py-3 rounded-xl shadow-elevated border flex items-center space-x-2 text-xs font-bold animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="truncate">{toastMessage.text}</span>
        </div>
      )}

      {/* Editor Header */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-brand-border/40 flex items-center justify-between bg-brand-light/30">
        <div className="flex items-center space-x-2 sm:space-x-3 truncate">
          <Link
            to="/campaigns"
            className="p-1.5 text-brand-dark/70 hover:text-brand-dark hover:bg-brand-light rounded-lg transition-colors shrink-0"
            title="Back to Campaigns"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-bold text-brand-dark flex items-center space-x-2 truncate">
              <span className="truncate">{campaign?.title || 'Template Editor'}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  campaign?.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {campaign?.status || 'DRAFT'}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {campaign?.status !== 'PUBLISHED' ? (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{saving ? 'Publishing...' : 'Publish'}</span>
            </button>
          ) : (
            <a
              href={`/c/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-brand-light text-brand-primary font-bold text-xs rounded-xl border border-brand-secondary/30 flex items-center space-x-1.5 hover:bg-brand-light/80 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Link</span>
            </a>
          )}
        </div>
      </div>

      {/* Desktop Toolbar (Hidden on small mobile) */}
      <div className="hidden sm:block">
        <ToolBar
          onAddPhotoArea={handleAddPhotoArea}
          onAddTextArea={handleAddTextArea}
          onAddShape={handleAddShape}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasSelection={!!selectedElementId}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(1.5, z + 0.08))}
          onZoomOut={() => setZoom((z) => Math.max(0.18, z - 0.08))}
          onFitCanvas={() => setZoom(calculateDefaultZoom())}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          onPreview={() => setShowPreviewModal(true)}
          onSave={handleSave}
          onPublish={handlePublish}
          isSaving={saving}
          isPublished={campaign?.status === 'PUBLISHED'}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <InteractiveCanvas
          posterUrl={posterUrl}
          elements={elements}
          fields={fields}
          selectedElementId={selectedElementId}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
          zoom={zoom}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
        />

        <PropertiesBar
          selectedElement={selectedElement}
          elements={elements}
          fields={fields}
          onUpdateSelected={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
          onSelectElement={handleSelectElement}
          onOpenFieldManager={() => setShowFieldModal(true)}
          canvasDimensions={{ width: 1080, height: 1350 }}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      {/* Mobile Floating Bottom Toolbar - Drawer is ONLY opened when user explicitly taps 'Style' */}
      <div className="sm:hidden bg-white/95 backdrop-blur-md border-t border-brand-border/80 p-2 flex items-center justify-around gap-1 z-30 shadow-elevated">
        <button
          onClick={handleAddPhotoArea}
          className="flex flex-col items-center justify-center p-1.5 text-brand-primary font-bold text-[10px] rounded-lg hover:bg-brand-light/60"
        >
          <ImageIcon className="w-4 h-4 mb-0.5" />
          <span>+ Photo</span>
        </button>

        <button
          onClick={handleAddTextArea}
          className="flex flex-col items-center justify-center p-1.5 text-brand-primary font-bold text-[10px] rounded-lg hover:bg-brand-light/60"
        >
          <Type className="w-4 h-4 mb-0.5" />
          <span>+ Text</span>
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className={`flex flex-col items-center justify-center p-1.5 font-bold text-[10px] rounded-lg transition-colors ${
            isMobileDrawerOpen ? 'text-brand-primary bg-brand-light' : 'text-brand-dark'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>{selectedElementId ? 'Edit Style' : 'Layers'}</span>
        </button>

        <button
          onClick={() => setShowPreviewModal(true)}
          className="flex flex-col items-center justify-center p-1.5 text-brand-secondary font-bold text-[10px] rounded-lg hover:bg-brand-light/60"
        >
          <Eye className="w-4 h-4 mb-0.5" />
          <span>Preview</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-col items-center justify-center p-1.5 px-3 bg-brand-primary text-white font-bold text-[10px] rounded-xl hover:bg-brand-primary/90 shadow-sm"
        >
          <Save className="w-4 h-4 mb-0.5" />
          <span>{saving ? 'Saving' : 'Save'}</span>
        </button>
      </div>

      {/* Field Manager Modal */}
      <FieldManagerModal
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        fields={fields}
        onSaveFields={(newFields) => {
          setFields(newFields);
          showToast('Dynamic fields updated.');
        }}
      />

      {/* Template Simulation Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        posterUrl={posterUrl}
        elements={elements}
        fields={fields}
      />
    </div>
  );
};
