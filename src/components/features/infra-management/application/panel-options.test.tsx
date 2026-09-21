import { describe, expect, it } from 'vitest';

import { withSelected } from './install-release-panel';

describe('withSelected', () => {
  it('목록에 없는 값이면 한 줄을 끼워 넣는다', () => {
    // 목록을 못 받았거나 값이 목록 밖이면 Select 가 "(삭제된 옵션)" 으로 그린다.
    expect(withSelected([], 'app-os-01')).toEqual([{ label: 'app-os-01', value: 'app-os-01' }]);
  });

  it('이미 있으면 그대로 둔다', () => {
    const options = [{ label: 'a', value: 'a' }];

    expect(withSelected(options, 'a')).toBe(options);
  });

  it('고른 값이 없으면 손대지 않는다', () => {
    const options = [{ label: 'a', value: 'a' }];

    expect(withSelected(options, '')).toBe(options);
  });
});
