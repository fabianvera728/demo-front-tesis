import { apiClient } from '@/services/apiClient';
import {
  DataSource,
  DataIntegration,
  Job,
  CreateIntegrationPayload,
  UpdateIntegrationPayload,
  ProcessingOperation,
  HarvestConfig,
  ProcessingConfig
} from '@/types/integration';

// Todas las URLs ahora van a través del API Gateway usando rutas genéricas

// Función para mapear datos del frontend (camelCase) al backend (snake_case)
const mapToBackendFormat = (payload: CreateIntegrationPayload) => {
  return {
    name: payload.name,
    description: payload.description,
    dataset_id: payload.datasetId,
    harvest_config: {
      source_type: payload.harvestConfig.source_type,
      config: payload.harvestConfig.config,
      column_mapping: payload.harvestConfig.column_mapping || {}
    },
    processing_config: payload.processingConfig ? {
      operations: payload.processingConfig.operations.map(op => ({
        id: op.id,
        parameters: op.parameters
      }))
    } : undefined,
    schedule_config: payload.schedule ? {
      type: payload.schedule.type,
      cron_expression: payload.schedule.cron,
      timezone: "UTC"
    } : undefined,
    is_active: true
  };
};

// Función para mapear datos del backend (snake_case) al frontend (camelCase)
const mapFromBackendFormat = (integration: any): DataIntegration => {
  return {
    id: integration.id,
    name: integration.name,
    description: integration.description,
    datasetId: integration.dataset_id,
    datasetName: integration.dataset_name || 'Dataset', // Fallback si no viene el nombre
    harvestConfig: {
      source_type: integration.harvest_config.source_type,
      config: integration.harvest_config.config,
      column_mapping: integration.harvest_config.column_mapping || {},
      schedule: integration.schedule_config ? {
        type: integration.schedule_config.type,
        cron: integration.schedule_config.cron_expression,
        enabled: integration.is_active
      } : undefined
    },
    processingConfig: integration.processing_config ? {
      operations: integration.processing_config.operations || []
    } : undefined,
    schedule: integration.schedule_config ? {
      type: integration.schedule_config.type,
      cron: integration.schedule_config.cron_expression,
      enabled: integration.is_active
    } : undefined,
    status: integration.status,
    lastRun: integration.last_run,
    nextRun: integration.next_run,
    createdAt: integration.created_at,
    updatedAt: integration.updated_at
  };
};

export const integrationService = {
  // Obtener fuentes de datos disponibles del harvester
  async getAvailableDataSources(): Promise<DataSource[]> {
    try {
      const response = await apiClient.get('/data-harvester/api/harvest/sources');
      return response.data.sources || response.data;
    } catch (error) {
      console.error('Error fetching data sources:', error);
      throw new Error('Failed to fetch available data sources');
    }
  },

  // Obtener operaciones de procesamiento disponibles
  async getAvailableProcessingOperations(): Promise<ProcessingOperation[]> {
    try {
      const response = await apiClient.get('/data-processor/operations');
      return response.data.operations || response.data;
    } catch (error) {
      console.error('Error fetching processing operations:', error);
      throw new Error('Failed to fetch processing operations');
    }
  },

  // Obtener datasets disponibles
  async getAvailableDatasets(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/data/datasets');
      return response.data;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }
  },

  // Gestión de integraciones
  async getAllIntegrations(): Promise<DataIntegration[]> {
    try {
      const response = await apiClient.get('/data-harvester/api/integrations');
      // Mapear los datos del backend al formato del frontend
      return response.data.map((integration: any) => mapFromBackendFormat(integration));
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw new Error('Failed to fetch integrations');
    }
  },

  async getIntegrationById(id: string): Promise<DataIntegration> {
    try {
      const response = await apiClient.get(`/data-harvester/api/integrations/${id}`);
      // Mapear los datos del backend al formato del frontend
      return mapFromBackendFormat(response.data);
    } catch (error) {
      console.error(`Error fetching integration ${id}:`, error);
      throw new Error('Failed to fetch integration');
    }
  },

  async createIntegration(payload: CreateIntegrationPayload): Promise<DataIntegration> {
    try {
      // Mapear los datos del frontend al formato que espera el backend
      const backendPayload = mapToBackendFormat(payload);
      const response = await apiClient.post('/data-harvester/api/integrations', backendPayload);
      // Mapear los datos de respuesta del backend al formato del frontend
      return mapFromBackendFormat(response.data);
    } catch (error) {
      console.error('Error creating integration:', error);
      throw new Error('Failed to create integration');
    }
  },

  async updateIntegration(id: string, payload: UpdateIntegrationPayload): Promise<DataIntegration> {
    try {
      // Mapear los datos de actualización al formato del backend
      const backendPayload: any = {};
      if (payload.name) backendPayload.name = payload.name;
      if (payload.description) backendPayload.description = payload.description;
      if (payload.datasetId) backendPayload.dataset_id = payload.datasetId;
      if (payload.harvestConfig) {
        backendPayload.harvest_config = {
          source_type: payload.harvestConfig.source_type,
          config: payload.harvestConfig.config,
          column_mapping: payload.harvestConfig.column_mapping || {}
        };
      }
      if (payload.processingConfig) {
        backendPayload.processing_config = {
          operations: payload.processingConfig.operations.map(op => ({
            id: op.id,
            parameters: op.parameters
          }))
        };
      }
      if (payload.status !== undefined) {
        backendPayload.is_active = payload.status === 'active';
      }

      const response = await apiClient.put(`/data-harvester/api/integrations/${id}`, backendPayload);
      return mapFromBackendFormat(response.data);
    } catch (error) {
      console.error(`Error updating integration ${id}:`, error);
      throw new Error('Failed to update integration');
    }
  },

  async deleteIntegration(id: string): Promise<void> {
    try {
      await apiClient.delete(`/data-harvester/api/integrations/${id}`);
    } catch (error) {
      console.error(`Error deleting integration ${id}:`, error);
      throw new Error('Failed to delete integration');
    }
  },

  // Función auxiliar para mapear jobs del backend al frontend
  mapJobFromBackend(job: any): Job {
    return {
      id: job.id,
      integrationId: job.integration_id,
      status: job.status,
      progress: job.progress,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      error: job.error_message,
      logs: job.logs?.map((log: string) => ({
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: log,
        service: 'orchestrator' as const
      })) || [],
      result: job.result ? {
        harvestedItems: job.result.items_harvested || 0,
        processedItems: job.result.items_processed || 0,
        datasetRowsAdded: job.result.items_inserted || 0,
        errors: job.result.errors?.length || 0,
        warnings: 0
      } : undefined
    };
  },

  // Gestión de trabajos (jobs)
  async runIntegration(id: string): Promise<Job> {
    try {
      const response = await apiClient.post(`/data-harvester/api/integrations/${id}/run`);
      return this.mapJobFromBackend(response.data);
    } catch (error) {
      console.error(`Error running integration ${id}:`, error);
      throw new Error('Failed to run integration');
    }
  },

  async getJobsByIntegration(integrationId: string): Promise<Job[]> {
    try {
      const response = await apiClient.get(`/data-harvester/api/jobs?integration_id=${integrationId}`);
      return response.data.map((job: any) => this.mapJobFromBackend(job));
    } catch (error) {
      console.error(`Error fetching jobs for integration ${integrationId}:`, error);
      throw new Error('Failed to fetch jobs');
    }
  },

  async getJobById(jobId: string): Promise<Job> {
    try {
      const response = await apiClient.get(`/data-harvester/api/jobs/${jobId}`);
      return this.mapJobFromBackend(response.data);
    } catch (error) {
      console.error(`Error fetching job ${jobId}:`, error);
      throw new Error('Failed to fetch job');
    }
  },

  async getAllJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get('/data-harvester/api/jobs');
      return response.data.map((job: any) => this.mapJobFromBackend(job));
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  },

  // Pruebas de configuración
  async testHarvestConfig(config: HarvestConfig): Promise<{ success: boolean; message: string; sample?: any[] }> {
    try {
      const response = await apiClient.post('/data-harvester/api/harvest/test', {
          source_type: config.source_type,
          config: config.config
      });
      
      return response.data;
    } catch (error) {
      console.error('Error testing harvest config:', error);
      return { success: false, message: 'Failed to test configuration' };
    }
  },

  async testProcessingConfig(config: ProcessingConfig, sampleData: any[]): Promise<{ success: boolean; message: string; result?: any[] }> {
    try {
      const response = await apiClient.post('/data-processor/test', {
          dataset: sampleData,
          operations: config.operations
      });
      
      return response.data;
    } catch (error) {
      console.error('Error testing processing config:', error);
      return { success: false, message: 'Failed to test processing configuration' };
    }
  },

  // Monitoreo en tiempo real
  createJobStatusWebSocket(jobId: string): WebSocket {
    const ws = new WebSocket(`ws://localhost:8000/ws/jobs/${jobId}`);
    
    // Procesar mensajes del WebSocket y mapear al formato del frontend
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
      try {
        const backendData = JSON.parse(event.data);
        const mappedData = {
          job_id: backendData.job_id,
          status: backendData.status,
          progress: backendData.progress,
          logs: backendData.logs || []
        };
        
        // Crear un nuevo evento con datos mapeados
        const mappedEvent = new MessageEvent('message', {
          data: JSON.stringify(mappedData)
        });
        
        if (originalOnMessage) {
          originalOnMessage.call(ws, mappedEvent);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        if (originalOnMessage) {
          originalOnMessage.call(ws, event);
        }
      }
    };
    
    return ws;
  },

  // Utilidades
  async uploadFileForTesting(file: File): Promise<{ success: boolean; fileInfo?: any; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source_type', 'file');

      const response = await apiClient.post('/data-harvester/api/harvest/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return { success: true, fileInfo: response.data.data };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, message: 'Failed to upload file' };
    }
  }
}; 