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