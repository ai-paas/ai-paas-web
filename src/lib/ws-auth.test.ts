import { describe, it, expect, afterEach } from 'vitest';

import { setAccessToken } from './api';
import { wsAuthProtocols } from './ws-auth';

describe('wsAuthProtocols', () => {
  afterEach(() => setAccessToken(null));

  it('토큰을 서브프로토콜로 넘긴다', () => {
    // 브라우저는 WebSocket 에 헤더를 붙일 수 없다. 이게 없으면 게이트웨이가 403 을 준다.
    setAccessToken('t-123');

    expect(wsAuthProtocols()).toEqual(['bearer', 't-123']);
  });

  it('토큰이 없으면 아무것도 제안하지 않는다', () => {
    // 빈 배열을 넘기면 브라우저가 핸드셰이크를 거부한다.
    setAccessToken(null);

    expect(wsAuthProtocols()).toBeUndefined();
  });

  it('토큰을 쿼리에 싣지 않는다', () => {
    // 쿼리에 실으면 액세스 로그와 리버스 프록시에 그대로 남는다.
    setAccessToken('t-123');

    expect(JSON.stringify(wsAuthProtocols())).not.toContain('?');
  });
});
