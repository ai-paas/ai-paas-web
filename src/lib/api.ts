import ky from 'ky';

const REFRESH_TOKEN_COOKIE_KEY = 'refreshToken';

type RefreshTokenResponse = {
  access_token?: string;
  refresh_token?: string;
};

type QueuedRequest = {
  request: Request;
  resolve: (response: Response) => void;
  reject: (error: unknown) => void;
};

let refreshPromise: Promise<string> | null = null;
let pendingRequests: QueuedRequest[] = [];
let accessTokenMemory: string | null = null;

const getCookie = (key: string) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedKey}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setCookie = (key: string, value: string) => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Strict${secure}`;
};

const clearCookie = (key: string) => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Strict${secure}`;
};

export const getAccessToken = () => accessTokenMemory;

export const setAccessToken = (token: string) => {
  accessTokenMemory = token;
};

export const setRefreshToken = (token: string) => {
  setCookie(REFRESH_TOKEN_COOKIE_KEY, token);
};

export const getRefreshToken = () => getCookie(REFRESH_TOKEN_COOKIE_KEY);

export const clearAuthTokens = () => {
  accessTokenMemory = null;
  clearCookie(REFRESH_TOKEN_COOKIE_KEY);
};

const queueRequest = (request: Request) =>
  new Promise<Response>((resolve, reject) => {
    pendingRequests.push({ request, resolve, reject });
  });

const flushQueuedRequests = (accessToken: string) => {
  const queued = pendingRequests;
  pendingRequests = [];

  queued.forEach(({ request, resolve, reject }) => {
    const nextRequest = request.clone();
    nextRequest.headers.set('Authorization', `Bearer ${accessToken}`);

    fetch(nextRequest).then(resolve).catch(reject);
  });
};

const rejectQueuedRequests = (error: unknown) => {
  const queued = pendingRequests;
  pendingRequests = [];

  queued.forEach(({ reject }) => {
    reject(error);
  });
};

const shouldSkipRefresh = (request: Request) => {
  return request.url.includes('/auth/refresh') || request.headers.get('x-retried') === 'true';
};

const markAsRetried = (request: Request) => {
  const retriedRequest = request.clone();
  retriedRequest.headers.set('x-retried', 'true');
  return retriedRequest;
};

const getOrCreateRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const api = ky.create({
  prefixUrl: `${import.meta.env.VITE_SERVER_URL}/api/v1`,
  timeout: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        const accessToken = getAccessToken();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        } else {
          const newAccessToken = await getOrCreateRefreshPromise();
          request.headers.set('Authorization', `Bearer ${newAccessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401 || shouldSkipRefresh(request)) {
          return response;
        }

        const retriedRequest = markAsRetried(request);
        const queuedResponse = queueRequest(retriedRequest);

        try {
          const newAccessToken = await getOrCreateRefreshPromise();
          flushQueuedRequests(newAccessToken);
          return queuedResponse;
        } catch (error) {
          rejectQueuedRequests(error);
          console.error(error);
          return response;
        }
      },
    ],
  },
});

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('리프레시 토큰이 존재하지 않습니다.');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('토큰 재발급이 실패했습니다.');
    }

    const data = (await response.json()) as RefreshTokenResponse;

    if (!data.access_token || !data.refresh_token) {
      throw new Error('토큰 재발급 응답이 올바르지 않습니다.');
    }

    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);

    return data.access_token;
  } catch (error) {
    clearAuthTokens();
    window.location.href = '/login';
    throw error;
  }
};
