import { mockTalents } from './mockData';

const MOCK_TOKEN = 'mock-jwt-token';

export const mockLogin = (email: string, password: string): string | null => {
  console.log('Attempting mock login with:', email, password);
  // Allow any email, but still require the password to be 'password'
  if (password === 'password') {
    console.log('Mock login successful');
    const mockUser = {
      _id: 'mock-user-id',
      email: email,
      name: 'Mock User',
      role: 'model'
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockToken', MOCK_TOKEN);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
    }
    return MOCK_TOKEN;
  }
  console.log('Mock login failed');
  return null;
};

export const mockLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mockToken');
    localStorage.removeItem('mockUser');
  }
};

export const getMockUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('mockUser');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const getMockToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mockToken');
  }
  return null;
};

export const isMockAuthenticated = () => {
  return !!getMockToken();
};