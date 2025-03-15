import { apiClient } from '@/services/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

const TOKEN_KEY = 'auth_token';

const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      
      setToken(response.data.token);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  },

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', {
        email,
        password,
        name,
      });
      
      setToken(response.data.token);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Ignore errors on logout
    } finally {
      removeToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = getToken();
    
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      removeToken();
      throw new Error('Failed to get current user');
    }
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
}; 