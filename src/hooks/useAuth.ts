import { useNavigate } from 'react-router';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/api';

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
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
  const isAdmin = accessToken ? parseJwt(accessToken)?.role === 'admin' : false;

  const logout = () => {
    clearAccessToken();
    navigate('/login');
  };

  return {
    accessToken,
    isAuthenticated,
    isAdmin,
    setAccessToken,
    logout,
  };
};
