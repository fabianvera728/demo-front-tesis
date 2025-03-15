import { mockUsers } from './mockData';

// Simulate a delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Use window instead of global for browser environment
const setCurrentUser = (user: any) => {
  // Store the current user in the mockData module
  (window as any).currentMockUser = user;
};

const getCurrentUser = () => {
  return (window as any).currentMockUser;
};

export const mockAuthService = {
  async login(email: string, password: string) {
    // Simulate API delay
    await delay(800);
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      console.error('Invalid login attempt:', email);
      throw new Error('Invalid email or password');
    }
    
    // Set the current user (omit password)
    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    
    // Store token in localStorage
    localStorage.setItem('auth_token', `mock-token-${user.id}`);
    
    console.log('Login successful:', userWithoutPassword);
    return userWithoutPassword;
  },
  
  async register(email: string, password: string, name: string) {
    // Simulate API delay
    await delay(1000);
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: `${mockUsers.length + 1}`,
      email,
      password,
      name
    };
    
    // Add to mock users
    mockUsers.push(newUser);
    
    // Set the current user (omit password)
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    
    // Store token in localStorage
    localStorage.setItem('auth_token', `mock-token-${newUser.id}`);
    
    return userWithoutPassword;
  },
  
  async logout() {
    await delay(500);
    
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
  },
  
  async getCurrentUser() {
    // Simulate API delay
    await delay(600);
    
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    // Extract user ID from token
    const userId = token.replace('mock-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    
    return userWithoutPassword;
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}; 