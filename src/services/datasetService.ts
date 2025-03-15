import { apiClient } from '@/services/apiClient';
import { 
  Dataset, 
  DatasetDetail, 
  CreateDatasetPayload, 
  UpdateDatasetPayload 
} from '@/types/dataset';

export const datasetService = {
  async getAllDatasets(): Promise<Dataset[]> {
    try {
      const response = await apiClient.get<Dataset[]>('/datasets');
      return response.data;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }
  },

  async getDatasetById(id: string): Promise<DatasetDetail> {
    try {
      const response = await apiClient.get<DatasetDetail>(`/datasets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dataset with id ${id}:`, error);
      throw new Error('Failed to fetch dataset details');
    }
  },

  async createDataset(payload: CreateDatasetPayload): Promise<Dataset> {
    try {
      const response = await apiClient.post<Dataset>('/datasets', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw new Error('Failed to create dataset');
    }
  },

  async updateDataset(id: string, payload: UpdateDatasetPayload): Promise<Dataset> {
    try {
      const response = await apiClient.put<Dataset>(`/datasets/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Error updating dataset with id ${id}:`, error);
      throw new Error('Failed to update dataset');
    }
  },

  async deleteDataset(id: string): Promise<void> {
    try {
      await apiClient.delete(`/datasets/${id}`);
    } catch (error) {
      console.error(`Error deleting dataset with id ${id}:`, error);
      throw new Error('Failed to delete dataset');
    }
  },

  async searchDatasetRows(id: string, query: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/datasets/${id}/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching in dataset with id ${id}:`, error);
      throw new Error('Failed to search dataset');
    }
  }
}; 