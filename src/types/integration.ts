export interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'api' | 'web';
  description: string;
  parameters?: Record<string, any>;
}

export interface HarvestConfig {
  source_type: 'file' | 'api' | 'web';
  config: Record<string, any>;
  column_mapping?: Record<string, string>; // mapeo de columnas fuente -> dataset
  schedule?: ScheduleConfig;
}

export interface ProcessingOperation {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ProcessingConfig {
  operations: ProcessingOperation[];
  config?: Record<string, any>;
}

export interface ScheduleConfig {
  type: 'once' | 'recurring';
  cron?: string; // Para trabajos recurrentes
  interval?: number; // En minutos para intervalos simples
  enabled: boolean;
}

export interface DataIntegration {
  id: string;
  name: string;
  description: string;
  datasetId: string;
  datasetName: string;
  harvestConfig: HarvestConfig;
  processingConfig?: ProcessingConfig;
  schedule?: ScheduleConfig;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  integrationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs?: JobLog[];
  result?: JobResult;
}

export interface JobLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  service: 'harvester' | 'processor' | 'orchestrator';
}

export interface JobResult {
  harvestedItems: number;
  processedItems: number;
  datasetRowsAdded: number;
  errors: number;
  warnings: number;
}

export interface CreateIntegrationPayload {
  name: string;
  description: string;
  datasetId: string;
  harvestConfig: HarvestConfig;
  processingConfig?: ProcessingConfig;
  schedule?: ScheduleConfig;
}

export interface UpdateIntegrationPayload {
  name?: string;
  description?: string;
  datasetId?: string;
  harvestConfig?: HarvestConfig;
  processingConfig?: ProcessingConfig;
  schedule?: ScheduleConfig;
  status?: 'active' | 'inactive';
}

// Tipos específicos para diferentes fuentes de datos
export interface ApiSourceConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'apikey';
    credentials?: Record<string, string>;
  };
  dataPath?: string; // JSONPath para extraer datos de la respuesta
}

export interface WebSourceConfig {
  url: string;
  selectors: Record<string, string>; // CSS selectors para extraer datos
  pagination?: {
    enabled: boolean;
    nextSelector?: string;
    maxPages?: number;
  };
  delay?: number; // Delay entre requests en ms
}

export interface FileSourceConfig {
  fileName: string;
  fileType: 'csv' | 'json' | 'xml';
  delimiter?: string; // Para CSV
  encoding?: string;
  skipRows?: number;
} 