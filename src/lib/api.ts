import ky from 'ky';

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

export const getAccessToken = () => accessTokenMemory;

export const setAccessToken = (token: string) => {
  accessTokenMemory = token;
  localStorage.setItem('is_authenticated', 'true');
};

export const clearAccessToken = () => {
  accessTokenMemory = null;
  localStorage.removeItem('is_authenticated');
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
  prefixUrl: '/api/v1',
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
  try {
    const response = await fetch('/api/v1/auth/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('토큰 재발급이 실패했습니다.');
    }

    const data = (await response.json()) as RefreshTokenResponse;

    if (!data.access_token) {
      throw new Error('토큰 재발급 응답이 올바르지 않습니다.');
    }

    setAccessToken(data.access_token);

    return data.access_token;
  } catch (error) {
    clearAccessToken();
    window.location.href = '/login';
    throw error;
  }
};
