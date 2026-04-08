import { useMutation } from '@tanstack/react-query';

interface LoginRequest {
  member_id: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
  });
};
