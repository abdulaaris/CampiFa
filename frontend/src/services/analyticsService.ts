import { api } from './api';
import { AnalyticsSummary } from '../types';

export const analyticsService = {
  async getCustomerAnalytics(period = '30d'): Promise<AnalyticsSummary> {
    const res = await api.get<{ success: boolean; data: AnalyticsSummary }>(
      `/analytics?period=${period}`
    );
    return res.data;
  },

  async getCampaignAnalytics(campaignId: string) {
    const res = await api.get<{ success: boolean; data: any }>(
      `/analytics/campaign/${campaignId}`
    );
    return res.data;
  },

  async trackEvent(campaignId: string, type: 'VIEW' | 'GENERATION' | 'DOWNLOAD' | 'SHARE') {
    try {
      await api.post('/analytics/event', { campaignId, type });
    } catch (e) {
      console.warn('Analytics tracking warning:', e);
    }
  },
};
