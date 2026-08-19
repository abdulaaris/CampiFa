import { api } from './api';
import { Generation } from '../types';

export interface GenerateResult {
  generationId: string;
  downloadUrl: string;
  outputUrl: string;
  filename: string;
}

export const generateService = {
  async generatePoster(data: {
    campaignId: string;
    fieldValues: Record<string, string>;
    photoFile?: File | null;
    anonymousSessionId?: string;
  }): Promise<GenerateResult> {
    if (data.photoFile) {
      const formData = new FormData();
      formData.append('campaignId', data.campaignId);
      formData.append('fieldValues', JSON.stringify(data.fieldValues));
      formData.append('photo', data.photoFile);
      if (data.anonymousSessionId) {
        formData.append('anonymousSessionId', data.anonymousSessionId);
      }

      const res = await api.post<{ success: boolean; data: GenerateResult; message: string }>(
        '/generate',
        formData
      );
      return res.data;
    } else {
      const res = await api.post<{ success: boolean; data: GenerateResult; message: string }>(
        '/generate',
        data
      );
      return res.data;
    }
  },

  async getGeneration(id: string): Promise<Generation> {
    const res = await api.get<{ success: boolean; data: { generation: Generation } }>(
      `/generate/${id}`
    );
    return res.data.generation;
  },
};
