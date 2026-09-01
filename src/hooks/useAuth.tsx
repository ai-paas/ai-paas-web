import {
  getAccessToken,
  getOrCreateRefreshPromise,
  setAccessToken as setApiAccessToken,
} from '@/lib/api';
import { useLogout } from '@/hooks/service/authentication';
import { parseJwt } from '@/util/jwt';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContext {
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState(getAccessToken());
  const [isLoading, setIsLoading] = useState(!accessToken);
  const queryClient = useQueryClient();
  const { mutateAsync: requestLogout } = useLogout();

  const setAccessToken = useCallback((token: string | null) => {
    setApiAccessToken(token);
    setAccessTokenState(token);
  }, []);

  const isAdmin = useMemo(() => {
    return accessToken ? parseJwt(accessToken)?.role === 'admin' : false;
  }, [accessToken]);

  const logout = useCallback(async () => {
    // 서버의 리프레시 토큰을 먼저 무효화하고(Authorization 헤더에 토큰 필요),
    // 응답과 무관하게 로컬 토큰·캐시를 정리한다 — 요청이 실패해도 클라이언트는 로그아웃된다.
    try {
      await requestLogout();
    } catch {
      // 서버 무효화 실패는 무시
    }
    setAccessToken(null);
    queryClient.clear();
  }, [requestLogout, queryClient, setAccessToken]);

  useEffect(() => {
    const init = async () => {
      if (!getAccessToken()) {
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
  }, [setAccessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      isAdmin,
      isLoading,
      setAccessToken,
      logout,
    }),
    [accessToken, isAdmin, isLoading, logout, setAccessToken]
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
