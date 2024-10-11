"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface MockUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'model' | 'agency';
}

interface MockAuthContextType {
  user: MockUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock user data
    const mockUser: MockUser = {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: email,
      role: 'model',
    };

    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    localStorage.setItem('mockToken', 'mock-jwt-token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockToken');
  };

  const getToken = () => {
    return localStorage.getItem('mockToken');
  };

  return (
    <MockAuthContext.Provider value={{ user, login, logout, getToken }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};