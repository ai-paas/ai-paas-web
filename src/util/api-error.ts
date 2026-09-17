import type { ApiError, ApiErrorInfo } from '@/lib/api';

// 오류 표시를 한 곳으로 모은다. 같은 함수가 7곳에 복제돼 있었고, 어느 것도 백엔드가 주는
// hint/detail 을 읽지 않아 "요청 실패" 만 보였다.

export const apiErrorInfo = (error: unknown): ApiErrorInfo | undefined =>
  (error as ApiError | undefined)?.apiError;

/**
 * 토스트 한 줄에 쓸 요약.
 *
 * <p>구체적인 것부터 고른다 — 필드 사유, 원본, 백엔드 요약, 마지막이 ky 의 상태 코드 문구다.
 * 백엔드 message 는 ErrorCode 기본 문구라 "잘못된 요청입니다" 처럼 아무 정보가 없을 수 있다.
 */
export const errorMessage = (error: unknown, fallback: string): string => {
  const info = apiErrorInfo(error);
  const candidate = [
    info?.fieldErrors?.find((e) => e?.reason)?.reason,
    info?.detail,
    info?.message,
    (error as Error | undefined)?.message,
  ].find((v) => typeof v === 'string' && v.trim());
  return candidate ?? fallback;
};

/** 사용자가 할 일. 없으면 빈 문자열. */
export const errorHint = (error: unknown): string => apiErrorInfo(error)?.hint ?? '';

/** CSP 원문 등 장문. 화면에서는 접어둔다. */
export const errorDetail = (error: unknown): string => {
  const info = apiErrorInfo(error);
  return info?.detail ?? info?.fieldErrors?.find((e) => e?.reason)?.reason ?? '';
};
