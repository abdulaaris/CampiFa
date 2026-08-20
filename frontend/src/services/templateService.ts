import { api } from './api';
import { CampaignTemplate, TemplateElement, CampaignField, FileAsset } from '../types';
import { clientStorageService } from './clientStorageService';

export interface TemplateResponse {
  template: CampaignTemplate;
  posterFile?: FileAsset | null;
  fields: CampaignField[];
  campaign: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
}

export const templateService = {
  async getTemplate(campaignId: string): Promise<TemplateResponse> {
    try {
      const res = await api.get<{ success: boolean; data: TemplateResponse }>(
        `/campaigns/${campaignId}/template`
      );
      return res.data;
    } catch {
      return clientStorageService.getTemplate(campaignId);
    }
  },

  async updateTemplate(
    campaignId: string,
    data: {
      width?: number;
      height?: number;
      backgroundFileId?: string | null;
      elements: any[];
      fields?: CampaignField[];
    }
  ) {
    try {
      const res = await api.put<{ success: boolean; data: { template: CampaignTemplate }; message: string }>(
        `/campaigns/${campaignId}/template`,
        data
      );
      return res.data.template;
    } catch {
      return clientStorageService.updateTemplate(campaignId, data);
    }
  },

  async validateTemplate(campaignId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const res = await api.post<{
        success: boolean;
        data: { isValid: boolean; errors: string[]; warnings: string[] };
      }>(`/campaigns/${campaignId}/template/validate`);
      return res.data;
    } catch {
      return clientStorageService.validateTemplate(campaignId);
    }
  },
};
