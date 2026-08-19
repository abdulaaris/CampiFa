import { api } from './api';
import { Campaign, CampaignTemplate, CampaignField } from '../types';

export const campaignService = {
  async getCampaigns(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await api.get<{
      success: boolean;
      data: {
        campaigns: Campaign[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/campaigns?${query.toString()}`);
    return res.data;
  },

  async getCampaignById(id: string) {
    const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/campaigns/${id}`);
    return res.data.campaign;
  },

  async createCampaign(data: { title: string; description?: string; category?: string; posterFileId?: string }) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      '/campaigns',
      data
    );
    return res.data.campaign;
  },

  async updateCampaign(id: string, data: { title?: string; description?: string; category?: string; posterFileId?: string }) {
    const res = await api.put<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}`,
      data
    );
    return res.data.campaign;
  },

  async publishCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}/publish`
    );
    return res.data.campaign;
  },

  async pauseCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}/pause`
    );
    return res.data.campaign;
  },

  async resumeCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}/resume`
    );
    return res.data.campaign;
  },

  async duplicateCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/campaigns/${id}/duplicate`
    );
    return res.data.campaign;
  },

  async deleteCampaign(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/campaigns/${id}`);
    return res;
  },

  async getPublicCampaign(slug: string) {
    const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/public/campaigns/${slug}`);
    return res.data.campaign;
  },
};
