import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TemplateEditor } from '../editor/TemplateEditor';

export const TemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div className="p-8 text-center text-xs text-brand-muted">Campaign ID not found.</div>;
  }

  return (
    <div className="w-full">
      <TemplateEditor campaignId={id} onBack={() => navigate('/campaigns')} />
    </div>
  );
};
