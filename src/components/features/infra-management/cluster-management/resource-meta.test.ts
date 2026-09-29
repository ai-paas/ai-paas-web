import { describe, it, expect } from 'vitest';
import { RESOURCE_CATEGORIES, RESOURCE_BY_ID, DEFAULT_RESOURCE } from './resource-meta';

const ids = () => RESOURCE_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));

describe('RESOURCE_CATEGORIES', () => {
  it('레일에는 쿠버네티스 리소스만 둔다', () => {
    // 터미널, 모니터링, 애드온, 작업 이력은 리소스가 아니다. 리소스 목록 안에 섞여 있으면
    // 네임스페이스 필터가 걸린 화면에서 상관없는 항목을 고르게 된다.
    expect(ids()).not.toContain('terminal');
    expect(ids()).not.toContain('monitoring');
    expect(ids()).not.toContain('addons');
    expect(ids()).not.toContain('operations');
  });

  it('리소스는 그대로 남는다', () => {
    // 탭으로 옮기면서 조용히 사라지면 쓰던 화면을 못 찾는다.
    for (const id of ['pods', 'deployments', 'services', 'secrets', 'nodes', 'namespaces']) {
      expect(ids()).toContain(id);
    }
  });

  it('GPU 는 리소스 쪽에 남는다', () => {
    // GPU 워크로드와 스케줄링은 쿠버네티스 리소스다. 운영 도구와 성격이 다르다.
    expect(ids()).toContain('gpu-workload');
    expect(ids()).toContain('gpu-scheduling');
  });

  it('id 는 겹치지 않는다', () => {
    expect(new Set(ids()).size).toBe(ids().length);
  });

  it('찾아보기 표는 모든 항목을 담는다', () => {
    expect(RESOURCE_BY_ID.size).toBe(ids().length);
  });

  it('처음 열리는 리소스는 실재한다', () => {
    expect(RESOURCE_BY_ID.has(DEFAULT_RESOURCE)).toBe(true);
  });
});
