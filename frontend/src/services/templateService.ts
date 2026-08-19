import { api } from './api';
import { CampaignTemplate, TemplateElement, CampaignField, FileAsset } from '../types';

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
    const res = await api.get<{ success: boolean; data: TemplateResponse }>(
      `/campaigns/${campaignId}/template`
    );
    return res.data;
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
    const res = await api.put<{ success: boolean; data: { template: CampaignTemplate }; message: string }>(
      `/campaigns/${campaignId}/template`,
      data
    );
    return res.data.template;
  },

  async validateTemplate(campaignId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const res = await api.post<{
      success: boolean;
      data: { isValid: boolean; errors: string[]; warnings: string[] };
    }>(`/campaigns/${campaignId}/template/validate`);
    return res.data;
  },
};
