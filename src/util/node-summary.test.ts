import { describe, it, expect } from 'vitest';
import { nodeSummaryLabel } from './node-summary';

describe('nodeSummaryLabel', () => {
  it('master 와 worker 대수를 함께 적는다', () => {
    expect(nodeSummaryLabel(1, 2)).toBe('master 1 + worker 2');
  });

  it('worker 가 없으면 master 만 적는다', () => {
    expect(nodeSummaryLabel(1, 0)).toBe('master 1');
  });

  it('HA 도 같은 규칙이다', () => {
    expect(nodeSummaryLabel(3, 5)).toBe('master 3 + worker 5');
  });

  it('등록형 클러스터는 대수를 모른다', () => {
    // 프로비저닝하지 않은 클러스터는 노드 정보가 없다. 0 으로 적으면 거짓말이다.
    expect(nodeSummaryLabel(undefined, undefined)).toBe('-');
    expect(nodeSummaryLabel(null, null)).toBe('-');
  });

  it('한쪽만 있어도 아는 만큼 적는다', () => {
    expect(nodeSummaryLabel(1, undefined)).toBe('master 1');
    expect(nodeSummaryLabel(undefined, 2)).toBe('worker 2');
  });
});
