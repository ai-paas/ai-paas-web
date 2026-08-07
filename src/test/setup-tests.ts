import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// jsdom 환경의 fetch/Request는 Node(undici) 구현이라 브라우저와 달리 상대 URL을
// 해석하지 못한다. 앱 코드(ky prefixUrl '/api/v1', refresh fetch)는 상대 경로를
// 쓰므로 location(http://localhost:3000) 기준으로 절대화해 MSW 핸들러에 도달시킨다.
const toAbsoluteUrl = <T extends RequestInfo | URL>(input: T): T =>
  typeof input === 'string' && input.startsWith('/')
    ? (new URL(input, window.location.href).toString() as T)
    : input;

const OriginalRequest = globalThis.Request;
globalThis.Request = class extends OriginalRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(toAbsoluteUrl(input), init);
  }
} as typeof Request;

const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => originalFetch(toAbsoluteUrl(input), init);

// MSW 서버 설정 (위 패치 이후에 listen해야 인터셉터가 패치된 fetch를 감싼다)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
