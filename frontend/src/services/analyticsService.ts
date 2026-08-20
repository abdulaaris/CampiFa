import { api } from './api';
import { AnalyticsSummary } from '../types';
import { clientStorageService } from './clientStorageService';

export const analyticsService = {
  async getCustomerAnalytics(period = '30d'): Promise<AnalyticsSummary> {
    try {
      const res = await api.get<{ success: boolean; data: AnalyticsSummary }>(
        `/analytics?period=${period}`
      );
      return res.data;
    } catch {
      const { campaigns } = clientStorageService.getCampaigns();
      const totalViews = campaigns.reduce((sum, c) => sum + (c.viewsCount || 0), 0);
      const totalGenerations = campaigns.reduce((sum, c) => sum + (c.generationsCount || 0), 0);
      const totalDownloads = campaigns.reduce((sum, c) => sum + (c.downloadsCount || 0), 0);
      const totalShares = campaigns.reduce((sum, c) => sum + (c.sharesCount || 0), 0);

      return {
        totals: {
          views: totalViews,
          generations: totalGenerations,
          downloads: totalDownloads,
          shares: totalShares,
          campaigns: campaigns.length,
          published: campaigns.filter((c) => c.status === 'PUBLISHED').length,
          drafts: campaigns.filter((c) => c.status !== 'PUBLISHED').length,
        },
        timeSeries: [],
        campaignPerformance: campaigns,
      };
    }
  },

  async getCampaignAnalytics(campaignId: string) {
    try {
      const res = await api.get<{ success: boolean; data: any }>(
        `/analytics/campaign/${campaignId}`
      );
      return res.data;
    } catch {
      const campaign = clientStorageService.getCampaignById(campaignId);
      return {
        campaign,
        totalViews: campaign.viewsCount || 0,
        totalGenerations: campaign.generationsCount || 0,
        totalDownloads: campaign.downloadsCount || 0,
        totalShares: campaign.sharesCount || 0,
      };
    }
  },

  async trackEvent(campaignId: string, type: 'VIEW' | 'GENERATION' | 'DOWNLOAD' | 'SHARE') {
    try {
      await api.post('/analytics/event', { campaignId, type });
    } catch {
      const mappedType = type === 'GENERATION' ? 'GENERATE' : type;
      clientStorageService.recordAnalytics(campaignId, mappedType as any);
    }
  },
};
