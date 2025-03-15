import { mockDatasets, mockDatasetDetails } from './mockData';
import { Dataset, DatasetDetail, CreateDatasetPayload, UpdateDatasetPayload } from '@/types/dataset';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const mockDatasetService = {
  async getAllDatasets(): Promise<Dataset[]> {
    await delay(800);
    
    return [...mockDatasets];
  },
  
  async getDatasetById(id: string): Promise<DatasetDetail> {
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
    
    mockDatasets.push(newDataset);
    
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
    
    mockDatasetDetails[newId] = newDatasetDetail;
    
    return newDataset;
  },
  
  async updateDataset(id: string, payload: UpdateDatasetPayload): Promise<Dataset> {
    await delay(900);
    
    const datasetIndex = mockDatasets.findIndex(d => d.id === id);
    
    if (datasetIndex === -1) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    const updatedDataset: Dataset = {
      ...mockDatasets[datasetIndex],
      name: payload.name ?? mockDatasets[datasetIndex].name,
      description: payload.description ?? mockDatasets[datasetIndex].description,
      tags: payload.tags ?? mockDatasets[datasetIndex].tags,
      isPublic: payload.isPublic ?? mockDatasets[datasetIndex].isPublic,
      updatedAt: new Date().toISOString()
    };
    
    mockDatasets[datasetIndex] = updatedDataset;
    
    if (mockDatasetDetails[id]) {
      mockDatasetDetails[id] = {
        ...mockDatasetDetails[id],
        ...updatedDataset
      };
    }
    
    return updatedDataset;
  },
  
  async deleteDataset(id: string): Promise<void> {
    await delay(700);
    
    const datasetIndex = mockDatasets.findIndex(d => d.id === id);
    
    if (datasetIndex === -1) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    mockDatasets.splice(datasetIndex, 1);
    
    if (mockDatasetDetails[id]) {
      delete mockDatasetDetails[id];
    }
  },
  
  async searchDatasetRows(id: string, query: string): Promise<any[]> {
    await delay(500);
    
    const dataset = mockDatasetDetails[id];
    
    if (!dataset) {
      throw new Error(`Dataset with id ${id} not found`);
    }
    
    if (!query.trim()) {
      return [...dataset.rows];
    }
    
    const lowerQuery = query.toLowerCase();
    return dataset.rows.filter(row => {
      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }
}; 