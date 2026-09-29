import { getAccessToken } from '@/lib/api';

/**
 * 게이트웨이의 WebSocket 인증 — 브라우저는 헤더를 붙일 수 없어 서브프로토콜로 토큰을 넘긴다.
 *
 * 토큰을 쿼리에 실으면 액세스 로그와 리버스 프록시에 그대로 남는다.
 */
export const wsAuthProtocols = () => {
  const token = getAccessToken();
  return token ? ['bearer', token] : undefined;
};
