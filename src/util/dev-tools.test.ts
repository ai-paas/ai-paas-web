import { beforeEach, describe, expect, it } from 'vitest';

import { disableDevTools, isDevToolsEnabled, syncDevToolsFromUrl } from './dev-tools';

describe('개발자 도구 스위치', () => {
  beforeEach(() => {
    disableDevTools();
  });

  it('토큰이 맞으면 켜진다', () => {
    expect(syncDevToolsFromUrl('?devTools=anycloud-e2e')).toBe(true);
    expect(isDevToolsEnabled()).toBe(true);
  });

  it('틀린 토큰으로는 켜지지 않는다', () => {
    expect(syncDevToolsFromUrl('?devTools=guess')).toBe(false);
    expect(isDevToolsEnabled()).toBe(false);
  });

  it('한 번 켜면 쿼리가 없어도 유지된다', () => {
    // 목록에서 상세로 갔다 오면 쿼리가 사라진다. 그때마다 주소를 다시 붙이게 할 수 없다.
    syncDevToolsFromUrl('?devTools=anycloud-e2e');

    expect(syncDevToolsFromUrl('')).toBe(true);
  });
});
