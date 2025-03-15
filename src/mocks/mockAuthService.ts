import { mockUsers } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const setCurrentUser = (user: any) => {
  (window as any).currentMockUser = user;
};

export const mockAuthService = {
  async login(email: string, password: string) {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.error('Invalid login attempt:', email);
      throw new Error('Invalid email or password');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    
    localStorage.setItem('auth_token', `mock-token-${user.id}`);
    
    console.log('Login successful:', userWithoutPassword);
    return userWithoutPassword;
  },
  
  async register(email: string, password: string, name: string) {
    await delay(1000);
    
    if (mockUsers.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    const newUser = {
      id: `${mockUsers.length + 1}`,
      email,
      password,
      name
    };
    
    mockUsers.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    
    localStorage.setItem('auth_token', `mock-token-${newUser.id}`);
    
    return userWithoutPassword;
  },
  
  async logout() {
    await delay(500);
    
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
  },
  
  async getCurrentUser() {
    await delay(600);
    
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    
    return userWithoutPassword;
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}; 