import { api } from './api';
import { Campaign, CampaignTemplate, CampaignField } from '../types';
import { clientStorageService } from './clientStorageService';

export const campaignService = {
  async getCampaigns(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    try {
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
    } catch {
      return clientStorageService.getCampaigns(params);
    }
  },

  async getCampaignById(id: string) {
    try {
      const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/campaigns/${id}`);
      return res.data.campaign;
    } catch {
      return clientStorageService.getCampaignById(id);
    }
  },

  async createCampaign(data: { title: string; description?: string; category?: string; posterFileId?: string }) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        '/campaigns',
        data
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.createCampaign(data);
    }
  },

  async updateCampaign(id: string, data: { title?: string; description?: string; category?: string; posterFileId?: string }) {
    try {
      const res = await api.put<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}`,
        data
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.updateCampaign(id, data);
    }
  },

  async publishCampaign(id: string) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}/publish`
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.publishCampaign(id);
    }
  },

  async pauseCampaign(id: string) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}/pause`
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.pauseCampaign(id);
    }
  },

  async resumeCampaign(id: string) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}/resume`
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.resumeCampaign(id);
    }
  },

  async duplicateCampaign(id: string) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}/duplicate`
      );
      return res.data.campaign;
    } catch {
      return clientStorageService.duplicateCampaign(id);
    }
  },

  async deleteCampaign(id: string) {
    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/campaigns/${id}`);
      return res;
    } catch {
      clientStorageService.deleteCampaign(id);
      return { success: true, message: 'Deleted successfully' };
    }
  },

  async getPublicCampaign(slug: string) {
    try {
      const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/public/campaigns/${slug}`);
      return res.data.campaign;
    } catch {
      return clientStorageService.getPublicCampaign(slug);
    }
  },
};
