import { useMutation } from '@tanstack/react-query';
import { getAccessToken } from '@/lib/api';

interface LoginRequest {
  member_id: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

const getLoginErrorMessage = (data: unknown, status: number) => {
  if (!data || typeof data !== 'object') return `HTTP ${status}`;

  const { detail, message } = data as { detail?: unknown; message?: unknown };
  if (typeof detail === 'string' && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const validationMessages = detail
      .map((item) =>
        item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string'
          ? item.msg
          : null
      )
      .filter((item): item is string => Boolean(item));
    if (validationMessages.length) return validationMessages.join(', ');
  }

  return typeof message === 'string' && message.trim() ? message : `HTTP ${status}`;
};

// 서버의 리프레시 토큰(쿠키)을 무효화한다. 이 호출 없이 메모리 토큰만 지우면
// 다음 새로고침 때 /auth/refresh 로 자동 재로그인되므로 로그아웃이 무력화된다.
// 로그아웃 전체 흐름은 useAuth().logout()이 오케스트레이션한다 — 직접 호출하지 말 것.
export const useLogout = () => {
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/v1/auth/logout`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (body: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch(`/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => null);
        throw new Error(getLoginErrorMessage(errorData, response.status));
      }

      return response.json();
    },
  });
};
