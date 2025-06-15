export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  rowCount: number;
  columnCount: number;
  tags: string[];
  isPublic: boolean;
}

export interface ApiDataset {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  row_count: number;
  column_count: number;
  tags: string[];
  is_public: boolean;
}

export interface DatasetColumn {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  description?: string;
}

export interface DatasetRow {
  id: string;
  [key: string]: any;
}

export interface DatasetDetail extends Dataset {
  columns: DatasetColumn[];
  rows: DatasetRow[];
}

export interface ApiDatasetDetail extends ApiDataset {  
  columns: DatasetColumn[];
  rows: DatasetRow[];
}

export interface PaginatedRows {
  rows: DatasetRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiPaginatedRows {
  rows: any[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface CreateDatasetPayload {
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  columns: Omit<DatasetColumn, 'id'>[];
  rows: Omit<DatasetRow, 'id'>[];
}

export interface UpdateDatasetPayload {
  name?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Añadir el tipo SearchOptions para usar en las búsquedas semánticas
export interface SearchOptions {
  mode: 'semantic' | 'exact' | 'hybrid';
  threshold: number; // 0-100 relevance threshold
  includeFields: string[]; // fields to search in
  hybridAlpha?: number; // peso para búsqueda híbrida (0-1)
  modelName?: string; // modelo de embeddings a usar
  expansionTerms?: string[]; // términos adicionales para expandir la consulta
} 