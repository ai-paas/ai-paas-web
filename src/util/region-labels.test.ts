import { describe, expect, it } from 'vitest';
import { hasRegionCity, regionLabel } from './region-labels';

describe('regionLabel', () => {
  it.each([
    ['ap-northeast-2', 'ap-northeast-2 (서울)'],
    ['asia-northeast3', 'asia-northeast3 (서울)'],
    ['koreacentral', 'koreacentral (서울)'],
    ['ap-tokyo-1', 'ap-tokyo-1 (도쿄)'],
    ['jp-tok', 'jp-tok (도쿄)'],
  ])('%s → %s', (code, expected) => {
    expect(regionLabel(code)).toBe(expected);
  });

  it('모르는 코드는 코드만 돌려준다', () => {
    // 신규 리전에 (undefined) 가 붙으면 안 된다.
    expect(regionLabel('mars-central-1')).toBe('mars-central-1');
  });

  it('없으면 빈 문자열', () => {
    expect(regionLabel(undefined)).toBe('');
    expect(regionLabel(null)).toBe('');
  });

  it('같은 도시를 여러 CSP 코드가 가리켜도 각각 맞는다', () => {
    expect(regionLabel('ap-seoul-1')).toContain('서울');
    expect(regionLabel('kr-seo')).toContain('서울');
  });
});

describe('hasRegionCity', () => {
  it('매핑 여부를 구분한다', () => {
    expect(hasRegionCity('us-east-1')).toBe(true);
    expect(hasRegionCity('mars-central-1')).toBe(false);
  });
});
