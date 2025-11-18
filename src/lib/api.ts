import ky from 'ky';
import { LOCAL_STORAGE } from '../constant/local-storage';

let refreshPromise: Promise<string> | null = null;

export const api = ky.create({
  prefixUrl: `${import.meta.env.VITE_SERVER_URL}/api/v1`,
  timeout: false,
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null;
            });
          }

          try {
            const newAccessToken = await refreshPromise;
            const originalRequest = request.clone();

            originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
            return fetch(originalRequest);
          } catch (error) {
            console.error(error);
            return response;
          }
        }
      },
    ],
  },
});

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE.REFRESH_TOKEN);

  if (!refreshToken) {
    throw new Error('리프레시 토큰이 존재하지 않습니다.');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('토큰 재발급이 실패했습니다.');
    }

    const data = await response.json();

    localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, data.access_token);
    localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, data.refresh_token);

    return data.access_token;
  } catch (error) {
    logout();
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN);
  window.location.href = '/login';
};
