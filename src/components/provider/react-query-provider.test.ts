import { HTTPError, TimeoutError, type NormalizedOptions } from 'ky';
import { describe, expect, it } from 'vitest';
import { queryClient, shouldRetryQuery } from './react-query-provider';

// 전역 재시도 정책(TODO 14) — 4xx·타임아웃은 즉시 중단, 5xx·네트워크만 제한 횟수 재시도.
// 실제 ky 에러 클래스로 검증한다(목킹 시 instanceof가 깨진다).

const request = new Request('http://localhost/x');
const httpError = (status: number) =>
  new HTTPError(new Response(null, { status }), request, {} as NormalizedOptions);

describe('shouldRetryQuery', () => {
  it.each([400, 401, 403, 404, 422])('HTTP %i(4xx)는 첫 실패부터 재시도하지 않는다', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false);
  });

  it.each([500, 502, 503, 504])('HTTP %i(5xx)는 최대 2회까지만 재시도한다', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(true);
    expect(shouldRetryQuery(1, httpError(status))).toBe(true);
    expect(shouldRetryQuery(2, httpError(status))).toBe(false);
  });

  it('네트워크 오류(TypeError)는 최대 2회까지만 재시도한다', () => {
    const networkError = new TypeError('Failed to fetch');
    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(1, networkError)).toBe(true);
    expect(shouldRetryQuery(2, networkError)).toBe(false);
  });

  it('타임아웃(TimeoutError)은 재시도하지 않는다 — 서버 hang에 스켈레톤만 길어진다', () => {
    expect(shouldRetryQuery(0, new TimeoutError(request))).toBe(false);
  });
});

describe('queryClient 기본 옵션', () => {
  it('쿼리 재시도는 shouldRetryQuery, 뮤테이션은 재시도하지 않는다', () => {
    const { queries, mutations } = queryClient.getDefaultOptions();
    expect(queries?.retry).toBe(shouldRetryQuery);
    expect(mutations?.retry).toBe(false);
  });
});
