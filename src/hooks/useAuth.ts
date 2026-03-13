import { useNavigate } from 'react-router';
import { LOCAL_STORAGE } from '@/constant/local-storage';

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
  const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(LOCAL_STORAGE.REFRESH_TOKEN);
  const navigate = useNavigate();

  const isAuthenticated = !!accessToken;
  const isAdmin = accessToken ? parseJwt(accessToken)?.role === 'admin' : false;

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN);
    navigate('/login');
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, accessToken);
    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN);
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
