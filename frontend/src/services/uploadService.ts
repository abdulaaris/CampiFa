import { api } from './api';
import { FileAsset } from '../types';

export const uploadService = {
  async uploadPoster(file: File): Promise<{ fileAsset: FileAsset; width: number; height: number; format: string }> {
    const formData = new FormData();
    formData.append('poster', file);
    const res = await api.post<{
      success: boolean;
      data: { fileAsset: FileAsset; width: number; height: number; format: string };
      message: string;
    }>('/uploads/poster', formData);
    return res.data;
  },

  async uploadPhoto(file: File): Promise<{ fileAsset: FileAsset; url: string; storageKey: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post<{
      success: boolean;
      data: { fileAsset: FileAsset; url: string; storageKey: string };
    }>('/uploads/photo', formData);
    return res.data;
  },

  async uploadLogo(file: File): Promise<{ fileAsset: FileAsset; url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await api.post<{
      success: boolean;
      data: { fileAsset: FileAsset; url: string };
    }>('/uploads/logo', formData);
    return res.data;
  },
};
