import { mockAuthService } from './mockAuthService';
import { mockDatasetService } from './mockDatasetService';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Helper to create a mock AxiosResponse
const createMockResponse = <T>(data: T): AxiosResponse<T> => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    request: {}
  };
};

// Helper to create a mock error response
const createMockErrorResponse = (message: string, status: number = 400) => {
  const error: any = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {} as InternalAxiosRequestConfig
  };
  return error;
};

// Mock API client
export const mockApiClient = {
  get: async <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    console.log(`Mock GET request to ${url}`, config);
    
    try {
      // Auth endpoints
      if (url === '/auth/me') {
        const userData = await mockAuthService.getCurrentUser();
        return createMockResponse<T>(userData as unknown as T);
      }
      
      // Dataset endpoints
      if (url === '/datasets') {
        const datasets = await mockDatasetService.getAllDatasets();
        return createMockResponse<T>(datasets as unknown as T);
      }
      
      if (url.match(/\/datasets\/[^/]+$/)) {
        const id = url.split('/').pop() as string;
        const dataset = await mockDatasetService.getDatasetById(id);
        return createMockResponse<T>(dataset as unknown as T);
      }
      
      if (url.match(/\/datasets\/[^/]+\/search$/)) {
        const id = url.split('/')[2];
        const query = config?.params?.query || '';
        const rows = await mockDatasetService.searchDatasetRows(id, query);
        return createMockResponse<T>(rows as unknown as T);
      }
      
      throw createMockErrorResponse(`Unhandled mock GET request to ${url}`, 404);
    } catch (error) {
      if (error instanceof Error) {
        throw createMockErrorResponse(error.message);
      }
      throw error;
    }
  },
  
  post: async <T = any>(url: string, data: any, config?: any): Promise<AxiosResponse<T>> => {
    console.log(`Mock POST request to ${url}`, data);
    
    try {
      // Auth endpoints
      if (url === '/auth/login') {
        try {
          const user = await mockAuthService.login(data.email, data.password);
          const token = `mock-token-${user.id}`;
          const responseData = { user, token };
          return createMockResponse<T>(responseData as unknown as T);
        } catch (error) {
          if (error instanceof Error) {
            throw createMockErrorResponse(error.message, 401);
          }
          throw error;
        }
      }
      
      if (url === '/auth/register') {
        try {
          const user = await mockAuthService.register(data.email, data.password, data.name);
          const token = `mock-token-${user.id}`;
          const responseData = { user, token };
          return createMockResponse<T>(responseData as unknown as T);
        } catch (error) {
          if (error instanceof Error) {
            throw createMockErrorResponse(error.message, 400);
          }
          throw error;
        }
      }
      
      if (url === '/auth/logout') {
        await mockAuthService.logout();
        return createMockResponse<T>(null as unknown as T);
      }
      
      // Dataset endpoints
      if (url === '/datasets') {
        const dataset = await mockDatasetService.createDataset(data);
        return createMockResponse<T>(dataset as unknown as T);
      }
      
      throw createMockErrorResponse(`Unhandled mock POST request to ${url}`, 404);
    } catch (error) {
      if (error instanceof Error && !('response' in error)) {
        throw createMockErrorResponse(error.message);
      }
      throw error;
    }
  },
  
  put: async <T = any>(url: string, data: any, config?: any): Promise<AxiosResponse<T>> => {
    console.log(`Mock PUT request to ${url}`, data);
    
    try {
      // Dataset endpoints
      if (url.match(/\/datasets\/[^/]+$/)) {
        const id = url.split('/').pop() as string;
        const dataset = await mockDatasetService.updateDataset(id, data);
        return createMockResponse<T>(dataset as unknown as T);
      }
      
      throw createMockErrorResponse(`Unhandled mock PUT request to ${url}`, 404);
    } catch (error) {
      if (error instanceof Error && !('response' in error)) {
        throw createMockErrorResponse(error.message);
      }
      throw error;
    }
  },
  
  patch: async <T = any>(url: string, data: any, config?: any): Promise<AxiosResponse<T>> => {
    console.log(`Mock PATCH request to ${url}`, data);
    
    try {
      // Dataset endpoints
      if (url.match(/\/datasets\/[^/]+$/)) {
        const id = url.split('/').pop() as string;
        const dataset = await mockDatasetService.updateDataset(id, data);
        return createMockResponse<T>(dataset as unknown as T);
      }
      
      throw createMockErrorResponse(`Unhandled mock PATCH request to ${url}`, 404);
    } catch (error) {
      if (error instanceof Error && !('response' in error)) {
        throw createMockErrorResponse(error.message);
      }
      throw error;
    }
  },
  
  delete: async <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    console.log(`Mock DELETE request to ${url}`);
    
    try {
      // Dataset endpoints
      if (url.match(/\/datasets\/[^/]+$/)) {
        const id = url.split('/').pop() as string;
        await mockDatasetService.deleteDataset(id);
        return createMockResponse<T>(null as unknown as T);
      }
      
      throw createMockErrorResponse(`Unhandled mock DELETE request to ${url}`, 404);
    } catch (error) {
      if (error instanceof Error && !('response' in error)) {
        throw createMockErrorResponse(error.message);
      }
      throw error;
    }
  }
}; 