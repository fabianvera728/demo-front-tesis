import { apiClient } from '@/services/apiClient';
import { 
  Dataset, 
  DatasetDetail, 
  CreateDatasetPayload, 
  UpdateDatasetPayload, 
  ApiDataset,
  ApiDatasetDetail,
  PaginatedRows,
  ApiPaginatedRows,
  PaginationParams,
  DatasetRow,
  SearchOptions
} from '@/types/dataset';

const transformRows = (rows: any[]): DatasetRow[] => {
  return rows.map(row => {
    if (row.data) {
      return {
        id: row.id,
        ...row.data
      };
    }
    return row;
  });
};

export const datasetService = {
  async getAllDatasets(): Promise<Dataset[]> {
    try {
      const response = await apiClient.get<ApiDataset[]>('/api/data/datasets');

      const formattedDatasets = response.data.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        createdAt: dataset.created_at,
        updatedAt: dataset.updated_at,
        userId: dataset.user_id,
        rowCount: dataset.row_count,
        columnCount: dataset.column_count,
        tags: dataset.tags,
        isPublic: dataset.is_public
      })) as Dataset[];

      return formattedDatasets;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }
  },

  async getDatasetById(id: string): Promise<DatasetDetail> {
    try {
      const response = await apiClient.get<ApiDatasetDetail>(`/api/data/datasets/${id}`);

      const formattedDataset = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
        userId: response.data.user_id,
        rowCount: response.data.row_count,
        columnCount: response.data.column_count,
        tags: response.data.tags,
        isPublic: response.data.is_public,
        columns: response.data.columns,
        rows: [] // Rows are empty by default now, fetched separately via getDatasetRows
      }
      
      return formattedDataset;
    } catch (error) {
      console.error(`Error fetching dataset with id ${id}:`, error);
      throw new Error('Failed to fetch dataset details');
    }
  },

  async getDatasetRows(id: string, params: PaginationParams): Promise<PaginatedRows> {
    try {
      const response = await apiClient.get<ApiPaginatedRows>(`/api/data/datasets/${id}/rows`, {
        params: {
          limit: params.limit,
          offset: params.offset
        }
      });

      return {
        rows: transformRows(response.data.rows),
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      };
    } catch (error) {
      console.error(`Error fetching dataset rows with id ${id}:`, error);
      throw new Error('Failed to fetch dataset rows');
    }
  },

  async createDataset(payload: CreateDatasetPayload): Promise<Dataset> {
    try {
      const response = await apiClient.post<Dataset>(
        '/api/data/datasets', 
        {
          name: payload.name,
          description: payload.description,
          tags: payload.tags,
          is_public: payload.isPublic,
          columns: payload.columns,
          rows: payload.rows,
          prompt_strategy: payload.prompt_strategy
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw new Error('Failed to create dataset');
    }
  },

  async updateDataset(id: string, payload: UpdateDatasetPayload): Promise<Dataset> {
    try {
      const response = await apiClient.put<Dataset>(`/api/data/datasets/${id}`, {
        name: payload.name,
        description: payload.description,
        tags: payload.tags,
        is_public: payload.isPublic
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating dataset with id ${id}:`, error);
      throw new Error('Failed to update dataset');
    }
  },

  async deleteDataset(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/data/datasets/${id}`);
    } catch (error) {
      console.error(`Error deleting dataset with id ${id}:`, error);
      throw new Error('Failed to delete dataset');
    }
  },

  async searchDatasetRows(id: string, query: string, options?: SearchOptions): Promise<any[]> {
    try {
      // Mapear el modo del frontend al tipo de búsqueda del backend
      let search_type = 'semantic';
      if (options) {
        if (options.mode === 'hybrid') {
          search_type = 'hybrid';
        } else if (options.mode === 'exact') {
          search_type = 'keyword';
        }
      }

      // Preparar parámetros generales de búsqueda
      const requestParams: any = {
        query: query,
        dataset_id: id,
        search_type: search_type,
        limit: 10, // Cambiar límite de 50 a 10
      };

      // Configurar hybrid_alpha solo si es modo híbrido
      if (search_type === 'hybrid' && options?.hybridAlpha !== undefined) {
        requestParams.hybrid_alpha = options.hybridAlpha;
      }

      // Añadir modelo personalizado si está especificado
      if (options?.modelName) {
        requestParams.embedding_model = options.modelName;
      }

      // Definir threshold mínimo de relevancia para filtrar resultados poco relevantes
      if (options?.threshold !== undefined) {
        // Convertir de porcentaje (0-100) a valor decimal (0-1)
        requestParams.min_score = options.threshold / 100;
      }

      // Activar expansión de consulta solo si se proporcionan términos personalizados
      if (options?.expansionTerms && options.expansionTerms.length > 0) {
        requestParams.expand_query = true;
        requestParams.expansion_terms = options.expansionTerms;
      }

      console.log('Search request parameters:', requestParams);
      
      const response = await apiClient.post<any>(`/search/search`, requestParams);

      console.log('Search response:', response.data);

      if (response.data && response.data.results) {
        return transformRows(response.data.results);
      }
      return [];
    } catch (error) {
      console.error(`Error searching in dataset with id ${id}:`, error);
      throw new Error('Failed to search dataset');
    }
  }
}; 