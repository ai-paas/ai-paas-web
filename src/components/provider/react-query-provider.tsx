import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HTTPError, TimeoutError } from 'ky';
import type { ReactNode } from 'react';

const MAX_QUERY_RETRIES = 2;

// 전역 쿼리 재시도 정책 — 재시도 계층은 여기 한 곳이다(ky 자체 retry는 0, lib/api.ts).
// 4xx는 재시도해도 결과가 같아(404 상세 진입 등) 즉시 에러를 표시하고,
// 타임아웃은 서버 hang 신호라 재시도하면 스켈레톤만 길어진다. 5xx·네트워크 오류만 제한 횟수 재시도한다.
// eslint-disable-next-line react-refresh/only-export-components
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (error instanceof HTTPError && error.response.status < 500) return false;
  if (error instanceof TimeoutError) return false;
  return failureCount < MAX_QUERY_RETRIES;
};

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 30 * 60 * 1000, // 30분
      retry: shouldRetryQuery,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // 자동 재시도 없음 — 5xx·네트워크 오류여도 서버가 이미 처리했을 수 있어(POST 중복 생성) 재시도는 사용자가 한다
      retry: false,
    },
  },
});

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
