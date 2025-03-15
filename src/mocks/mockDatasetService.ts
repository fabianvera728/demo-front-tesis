import { mockDatasets, mockDatasetDetails } from './mockData';
import { Dataset, DatasetDetail, CreateDatasetPayload, UpdateDatasetPayload } from '@/types/dataset';

// Simulate a delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const mockDatasetService = {
  async getAllDatasets(): Promise<Dataset[]> {
    // Simulate API delay
    await delay(800);
    
    return [...mockDatasets];
  },
  
  async getDatasetById(id: string): Promise<DatasetDetail> {
    // Simulate API delay
    await delay(600);
    
    const dataset = mockDatasetDetails[id];
    
    if (!dataset) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    return { ...dataset };
  },
  
  async createDataset(payload: CreateDatasetPayload): Promise<Dataset> {
    // Simulate API delay
    await delay(1200);
    
    const newId = generateId();
    const now = new Date().toISOString();
    
    // Create new dataset
    const newDataset: Dataset = {
      id: newId,
      name: payload.name,
      description: payload.description,
      tags: payload.tags,
      isPublic: payload.isPublic,
      createdAt: now,
      updatedAt: now,
      userId: '1', // Assuming current user has ID 1
      rowCount: payload.rows.length,
      columnCount: payload.columns.length
    };
    
    // Add to mock datasets
    mockDatasets.push(newDataset);
    
    // Create dataset detail
    const newDatasetDetail: DatasetDetail = {
      ...newDataset,
      columns: payload.columns.map((col, index) => ({
        ...col,
        id: (index + 1).toString()
      })),
      rows: payload.rows.map((row, index) => ({
        ...row,
        id: (index + 1).toString()
      }))
    };
    
    // Add to mock dataset details
    mockDatasetDetails[newId] = newDatasetDetail;
    
    return newDataset;
  },
  
  async updateDataset(id: string, payload: UpdateDatasetPayload): Promise<Dataset> {
    // Simulate API delay
    await delay(900);
    
    // Find dataset
    const datasetIndex = mockDatasets.findIndex(d => d.id === id);
    
    if (datasetIndex === -1) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    // Update dataset
    const updatedDataset: Dataset = {
      ...mockDatasets[datasetIndex],
      name: payload.name ?? mockDatasets[datasetIndex].name,
      description: payload.description ?? mockDatasets[datasetIndex].description,
      tags: payload.tags ?? mockDatasets[datasetIndex].tags,
      isPublic: payload.isPublic ?? mockDatasets[datasetIndex].isPublic,
      updatedAt: new Date().toISOString()
    };
    
    // Update in mock datasets
    mockDatasets[datasetIndex] = updatedDataset;
    
    // Update in mock dataset details if it exists
    if (mockDatasetDetails[id]) {
      mockDatasetDetails[id] = {
        ...mockDatasetDetails[id],
        ...updatedDataset
      };
    }
    
    return updatedDataset;
  },
  
  async deleteDataset(id: string): Promise<void> {
    // Simulate API delay
    await delay(700);
    
    // Find dataset
    const datasetIndex = mockDatasets.findIndex(d => d.id === id);
    
    if (datasetIndex === -1) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    // Remove from mock datasets
    mockDatasets.splice(datasetIndex, 1);
    
    // Remove from mock dataset details if it exists
    if (mockDatasetDetails[id]) {
      delete mockDatasetDetails[id];
    }
  },
  
  async searchDatasetRows(id: string, query: string): Promise<any[]> {
    // Simulate API delay
    await delay(500);
    
    // Find dataset detail
    const dataset = mockDatasetDetails[id];
    
    if (!dataset) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    // If query is empty, return all rows
    if (!query.trim()) {
      return [...dataset.rows];
    }
    
    // Search in all fields of all rows
    const lowerQuery = query.toLowerCase();
    return dataset.rows.filter(row => {
      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }
}; 