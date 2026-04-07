import { useNavigate } from 'react-router';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/lib/api';

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const navigate = useNavigate();

  const isAuthenticated = !!refreshToken;
  const isAdmin = accessToken ? parseJwt(accessToken)?.role === 'admin' : false;

  const logout = () => {
    clearAuthTokens();
    navigate('/login');
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  };

  const clearTokens = () => {
    clearAuthTokens();
  };

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    logout,
    setTokens,
    clearTokens,
  };
};
