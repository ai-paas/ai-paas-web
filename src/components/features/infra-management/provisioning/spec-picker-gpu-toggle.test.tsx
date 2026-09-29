import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SpecPicker } from './spec-picker';

vi.mock('@/hooks/service/providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/service/providers')>();
  // 목록 조회만 막는다. 모듈 전체를 바꾸면 다른 import 가 끊긴다.
  return { ...actual, useGetProviderSpecs: () => ({ specs: [], isPending: false, isError: false }) };
});

describe('GPU 만 보기 토글', () => {
  it('켜고 끌 때 바깥에 알린다', async () => {
    /*
     * 필터를 켠다는 것은 GPU 로 만들겠다는 뜻이다. 아직 고르지 않았어도 드라이버 스택을 미리
     * 켜 두면 고르고 나서 애드온을 다시 찾아 켤 일이 없다.
     */
    const onGpuOnlyChange = vi.fn();
    render(
      <SpecPicker
        provider="AWS"
        credentialId="cred-1"
        region="ap-northeast-2"
        onChange={vi.fn()}
        onGpuOnlyChange={onGpuOnlyChange}
      />
    );

    const chip = screen.getByRole('button', { name: 'GPU만 보기' });
    await userEvent.click(chip);
    expect(onGpuOnlyChange).toHaveBeenLastCalledWith(true);
    expect(chip).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(chip);
    expect(onGpuOnlyChange).toHaveBeenLastCalledWith(false);
  });
});
