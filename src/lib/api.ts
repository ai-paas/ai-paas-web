import ky from 'ky';

type RefreshTokenResponse = {
  access_token?: string;
};

type QueuedRequest = {
  request: Request;
  resolve: (response: Response) => void;
  reject: (error: unknown) => void;
};

let refreshPromise: Promise<string> | null = null;
let pendingRequests: QueuedRequest[] = [];
let accessTokenMemory: string | null = null;
// 메모리 토큰이 인증 상태의 유일한 원본이다. AuthProvider가 useSyncExternalStore로 구독해
// 미러링하므로, ky 훅 안에서 일어나는 refresh 성공(새 토큰)·실패(null)가 UI 인증 상태에 반영된다.
const accessTokenListeners = new Set<() => void>();

export const getAccessToken = () => accessTokenMemory;

export const setAccessToken = (token: string | null) => {
  if (accessTokenMemory === token) return;
  accessTokenMemory = token;
  accessTokenListeners.forEach((listener) => listener());
};

// useSyncExternalStore의 subscribe 시그니처 — 해제 함수를 반환한다.
export const subscribeAccessToken = (listener: () => void) => {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
};

export const clearAccessToken = () => {
  setAccessToken(null);
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

export const getOrCreateRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

// 요청 기본 타임아웃 — 서버 hang 시 무한 로딩을 막는다(nginx proxy_read_timeout이 900s라 게이트웨이가 끊어주지 않는다).
// 대용량 업로드처럼 오래 걸리는 요청만 호출부에서 개별 확대(timeout: false)한다.
export const DEFAULT_TIMEOUT_MS = 30_000;

export const api = ky.create({
  prefixUrl: '/api/v1',
  timeout: DEFAULT_TIMEOUT_MS,
  // 재시도 정책은 React Query 한 곳(react-query-provider.tsx)에서만 — ky 자체 재시도와 중첩되면 요청이 최대 9회까지 늘어난다
  retry: 0,
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
    beforeError: [
      async (error) => {
        try {
          const body = (await error.response.clone().json()) as { detail?: unknown };
          if (typeof body.detail === 'string' && body.detail.trim()) {
            error.message = body.detail;
          }
        } catch {
          // keep original error
        }
        return error;
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401 || shouldSkipRefresh(request)) {
          return response;
        }

        const retriedRequest = markAsRetried(request);
        const queuedResponse = queueRequest(retriedRequest);
        // refresh 실패 시 아래 catch가 원 401 응답을 반환하므로 이 프로미스는 소비자 없이 reject된다 —
        // unhandled rejection(브라우저 콘솔 'Uncaught (in promise)')이 되지 않도록 미리 흡수한다.
        // 성공 경로의 return queuedResponse 는 영향 없다(catch 체인은 별도 파생 프로미스).
        queuedResponse.catch(() => undefined);

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

export const refreshAccessToken = async () => {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
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
    throw error;
  }
};
