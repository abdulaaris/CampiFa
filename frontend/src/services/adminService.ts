import { api } from './api';
import { User, Campaign } from '../types';

export const adminService = {
  async getOverview() {
    const res = await api.get<{
      success: boolean;
      data: {
        stats: {
          totalCustomers: number;
          totalCampaigns: number;
          publishedCampaigns: number;
          totalGenerations: number;
          totalDownloads: number;
        };
        recentCampaigns: Campaign[];
        recentCustomers: User[];
      };
    }>('/admin/overview');
    return res.data;
  },

  async getCustomers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await api.get<{
      success: boolean;
      data: {
        customers: (User & { _count?: { campaigns: number } })[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/admin/customers?${query.toString()}`);
    return res.data;
  },

  async getCustomerById(id: string) {
    const res = await api.get<{ success: boolean; data: { customer: User } }>(`/admin/customers/${id}`);
    return res.data.customer;
  },

  async suspendCustomer(id: string) {
    const res = await api.post<{ success: boolean; data: { user: User }; message: string }>(
      `/admin/customers/${id}/suspend`
    );
    return res.data.user;
  },

  async activateCustomer(id: string) {
    const res = await api.post<{ success: boolean; data: { user: User }; message: string }>(
      `/admin/customers/${id}/activate`
    );
    return res.data.user;
  },

  async deleteCustomer(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/admin/customers/${id}`);
    return res;
  },

  async getCampaigns(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await api.get<{
      success: boolean;
      data: {
        campaigns: Campaign[];
        pagination: { total: number; page: number; limit: number; pages: number };
      };
    }>(`/admin/campaigns?${query.toString()}`);
    return res.data;
  },

  async pauseCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/admin/campaigns/${id}/pause`
    );
    return res.data.campaign;
  },

  async resumeCampaign(id: string) {
    const res = await api.post<{ success: boolean; data: { campaign: Campaign }; message: string }>(
      `/admin/campaigns/${id}/resume`
    );
    return res.data.campaign;
  },

  async deleteCampaign(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/admin/campaigns/${id}`);
    return res;
  },
};
