import { describe, expect, it } from 'vitest';

import { preferredImage } from './preferred-image';

const opt = (text: string) => ({ text, value: text });

describe('기본 OS 이미지', () => {
  it('CSP 마다 다른 표기를 같은 것으로 본다', () => {
    expect(preferredImage([opt('ubuntu_24_04_x64_20G_alibase_20260828.vhd')])?.value).toContain('24_04');
    expect(preferredImage([opt('Canonical-Ubuntu-24.04-Minimal-2026.08.25-0')])?.value).toContain('24.04');
    expect(preferredImage([opt('ibm-ubuntu-24-04-4-minimal-amd64-7')])?.value).toContain('24-04');
  });

  it('최신 릴리스가 먼저 와도 검증한 버전을 고른다', () => {
    // 목록은 최신순이라 첫 값을 쓰면 kubeadm 패키지가 없는 버전이 잡힌다.
    const picked = preferredImage([opt('ubuntu-26.04-lts'), opt('ubuntu-24.04-lts')]);

    expect(picked?.value).toBe('ubuntu-24.04-lts');
  });

  it('arm 이미지는 고르지 않는다', () => {
    expect(preferredImage([opt('ubuntu_24_04_arm64_20G.vhd')])).toBeUndefined();
  });

  it('없으면 고르지 않는다', () => {
    expect(preferredImage([opt('rocky-9')])).toBeUndefined();
    expect(preferredImage([])).toBeUndefined();
  });
});
