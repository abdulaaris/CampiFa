import React, { useState } from 'react';
import { CampaignField, FieldType } from '../types';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';

interface FieldManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: CampaignField[];
  onSaveFields: (fields: CampaignField[]) => void;
}

export const FieldManagerModal: React.FC<FieldManagerModalProps> = ({
  isOpen,
  onClose,
  fields: initialFields,
  onSaveFields,
}) => {
  const [fields, setFields] = useState<CampaignField[]>(initialFields || []);
  const [newField, setNewField] = useState<{
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder: string;
    maxLength: number;
  }>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    maxLength: 60,
  });
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleAddField = () => {
    setError('');
    if (!newField.label.trim()) {
      setError('Please provide a field label.');
      return;
    }

    let rawName = newField.name.trim();
    if (!rawName) {
      rawName = newField.label
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '')
        .trim();
    }

    if (!rawName) rawName = `field_${fields.length + 1}`;

    if (fields.some((f) => f.name.toLowerCase() === rawName.toLowerCase())) {
      setError(`A field with name "${rawName}" already exists.`);
      return;
    }

    const fieldToAdd: CampaignField = {
      name: rawName,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder.trim() || null,
      maxLength: newField.maxLength || null,
      orderIndex: fields.length,
    };

    setFields([...fields, fieldToAdd]);
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      maxLength: 60,
    });
  };

  const handleDeleteField = (name: string) => {
    setFields(fields.filter((f) => f.name !== name));
  };

  const handleSave = () => {
    onSaveFields(fields);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-elevated border border-brand-border/60 max-w-2xl w-full p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Manage Campaign Fields</h3>
            <p className="text-xs text-brand-muted">
              Configure dynamic fields collected from public users when personalizing this poster.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-muted hover:text-brand-dark rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Fields List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {fields.map((f, idx) => (
            <div
              key={f.name}
              className="p-3 bg-brand-light/30 border border-brand-border/60 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-brand-dark">{f.label}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-brand-light text-brand-primary rounded">
                      {`{{${f.name}}}`}
                    </span>
                    {f.required && (
                      <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-muted">Type: {f.type}</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteField(f.name)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Field Box */}
        <div className="p-4 bg-brand-light/40 border border-brand-secondary/20 rounded-xl space-y-3 mt-2">
          <h4 className="font-bold text-xs text-brand-primary">+ Add New Dynamic Field</h4>

          {error && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-brand-dark block mb-1">Field Label *</label>
              <input
                type="text"
                placeholder="e.g. Your Name / Designation"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-brand-dark block mb-1">
                Field Identifier (Slug)
              </label>
              <input
                type="text"
                placeholder="e.g. name / designation"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-brand-dark block mb-1">Field Type</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
                className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs"
              >
                <option value="text">Text (Single Line)</option>
                <option value="photo">Photo Upload</option>
                <option value="textarea">Textarea (Multi-Line)</option>
                <option value="number">Number</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-brand-dark block mb-1">Placeholder</label>
              <input
                type="text"
                placeholder="e.g. Enter your full name"
                value={newField.placeholder}
                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-brand-border/80 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-brand-dark cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="rounded text-brand-primary focus:ring-brand-primary"
              />
              <span>Required field</span>
            </label>

            <button
              onClick={handleAddField}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary/90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-border/40 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-brand-dark rounded-xl text-xs font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
