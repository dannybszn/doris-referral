import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedToken && storedRefreshToken) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  const login = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    router.push('/account/login');
  };

  const refreshTokens = async () => {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { token: newToken, refreshToken: newRefreshToken } = await response.json();
        login(newToken, newRefreshToken);
        return newToken;
      } else {
        logout();
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  };

  const getAuthHeaders = async () => {
    if (!token) return {};

    try {
      const response = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        return { 'Authorization': `Bearer ${token}` };
      } else if (response.status === 401) {
        const data = await response.json();
        if (data.tokenExpired) {
          const newToken = await refreshTokens();
          if (newToken) {
            return { 'Authorization': `Bearer ${newToken}` };
          }
        }
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }

    logout();
    return {};
  };

  return { token, login, logout, getAuthHeaders };
};