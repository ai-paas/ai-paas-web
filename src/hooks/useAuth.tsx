import { clearAccessToken, getAccessToken, getOrCreateRefreshPromise } from '@/lib/api';
import { parseJwt } from '@/util/jwt';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContext {
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState(getAccessToken());
  const [isLoading, setIsLoading] = useState(!accessToken);

  const isAdmin = useMemo(() => {
    return accessToken ? parseJwt(accessToken)?.role === 'admin' : false;
  }, [accessToken]);

  const logout = () => {
    clearAccessToken();
    setAccessToken(null);
  };

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        try {
          const newAccessToken = await getOrCreateRefreshPromise();
          setAccessToken(newAccessToken);
        } catch {
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      isAdmin,
      isLoading,
      setAccessToken,
      logout,
    }),
    [accessToken, isAdmin, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext<AuthContext | null>(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
