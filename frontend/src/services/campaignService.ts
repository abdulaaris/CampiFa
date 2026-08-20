import { api } from './api';
import { Campaign, CampaignTemplate, CampaignField } from '../types';
import { clientStorageService } from './clientStorageService';

export const campaignService = {
  async getCampaigns(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const local = clientStorageService.getCampaigns(params);
    let remoteCampaigns: Campaign[] = [];

    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await api.get<any>(`/campaigns?${query.toString()}`);
      if (res?.data?.campaigns && Array.isArray(res.data.campaigns)) {
        remoteCampaigns = res.data.campaigns;
      }
    } catch {}

    // Merge remote and local campaigns (deduplicating by id/slug)
    const map = new Map<string, Campaign>();
    (local.campaigns || []).forEach((c) => map.set(c.id, c));
    remoteCampaigns.forEach((c) => map.set(c.id, c));

    let all = Array.from(map.values());
    if (params?.status && params.status !== 'ALL') {
      all = all.filter((c) => c.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      all = all.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      campaigns: all,
      pagination: {
        total: all.length,
        page: 1,
        limit: 50,
        pages: 1,
      },
    };
  },

  async getCampaignById(id: string) {
    try {
      const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/campaigns/${id}`);
      if (res?.data?.campaign) {
        clientStorageService.updateCampaign(id, res.data.campaign);
        return res.data.campaign;
      }
    } catch {}
    return clientStorageService.getCampaignById(id);
  },

  async createCampaign(data: { title: string; description?: string; category?: string; posterFileId?: string }) {
    let camp: Campaign | null = null;
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        '/campaigns',
        data
      );
      if (res?.data?.campaign) {
        camp = res.data.campaign;
      }
    } catch {}

    if (!camp) {
      camp = clientStorageService.createCampaign(data);
    } else {
      // Sync into client storage too
      clientStorageService.updateCampaign(camp.id, camp);
    }
    return camp;
  },

  async updateCampaign(id: string, data: { title?: string; description?: string; category?: string; posterFileId?: string }) {
    let camp: Campaign | null = null;
    try {
      const res = await api.put<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}`,
        data
      );
      if (res?.data?.campaign) {
        camp = res.data.campaign;
      }
    } catch {}

    const localCamp = clientStorageService.updateCampaign(id, data);
    return camp || localCamp;
  },

  async publishCampaign(id: string) {
    try {
      await api.post(`/campaigns/${id}/publish`).catch(() => {});
    } catch {}
    return clientStorageService.publishCampaign(id);
  },

  async pauseCampaign(id: string) {
    try {
      await api.post(`/campaigns/${id}/pause`).catch(() => {});
    } catch {}
    return clientStorageService.pauseCampaign(id);
  },

  async resumeCampaign(id: string) {
    try {
      await api.post(`/campaigns/${id}/resume`).catch(() => {});
    } catch {}
    return clientStorageService.resumeCampaign(id);
  },

  async duplicateCampaign(id: string) {
    try {
      const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
        `/campaigns/${id}/duplicate`
      );
      if (res?.data?.campaign) {
        clientStorageService.updateCampaign(res.data.campaign.id, res.data.campaign);
        return res.data.campaign;
      }
    } catch {}
    return clientStorageService.duplicateCampaign(id);
  },

  async deleteCampaign(id: string) {
    try {
      await api.delete(`/campaigns/${id}`).catch(() => {});
    } catch {}
    clientStorageService.deleteCampaign(id);
    return { success: true, message: 'Deleted successfully' };
  },

  async getPublicCampaign(slug: string) {
    try {
      const res = await api.get<{ success: boolean; data: { campaign: Campaign } }>(`/public/campaigns/${slug}`);
      if (res?.data?.campaign) {
        return res.data.campaign;
      }
    } catch {}
    return clientStorageService.getPublicCampaign(slug);
  },
};
