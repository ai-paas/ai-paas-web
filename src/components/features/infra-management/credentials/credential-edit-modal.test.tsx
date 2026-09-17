import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CredentialEditModal } from './credential-edit-modal';

const updateCredential = vi.fn();
const revealCredential = vi.fn();

vi.mock('@/hooks/service/credentials', () => ({
  useUpdateCredential: (opts: { onSuccess?: () => void }) => ({
    updateCredential: (vars: unknown) => {
      updateCredential(vars);
      opts?.onSuccess?.();
    },
    isPending: false,
  }),
  revealCredential: (id: string) => revealCredential(id),
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

const credential = {
  id: 'c1',
  name: 'aws-e2e-01',
  provider: 'AWS',
  description: '기존 설명',
  credentialKeys: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
};

const open = () =>
  render(<CredentialEditModal isOpen credential={credential} onClose={vi.fn()} />);

describe('CredentialEditModal', () => {
  beforeEach(() => {
    updateCredential.mockReset();
    revealCredential.mockReset();
  });

  it('이름과 프로바이더는 바꿀 수 없다고 보여준다', () => {
    open();

    // 입력이 아니라 읽기 전용 표시여야 한다 — 바꿀 수 없는 것을 입력창으로 두면 시도하게 된다.
    expect(screen.getByText('aws-e2e-01')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('설명만 고치면 값은 보내지 않는다', async () => {
    open();

    fireEvent.change(screen.getByDisplayValue('기존 설명'), { target: { value: '바뀐 설명' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(updateCredential).toHaveBeenCalled());
    expect(updateCredential.mock.calls[0][0]).toEqual({
      credentialId: 'c1',
      description: '바뀐 설명',
      credentials: undefined,
    });
  });

  it('값 교체를 켜면 모든 키의 입력칸이 열린다', () => {
    open();

    fireEvent.click(screen.getByLabelText(/값 교체/));

    credential.credentialKeys.forEach((k) => expect(screen.getByLabelText(k)).toBeInTheDocument());
  });

  it('값 교체를 켜고 한 칸이라도 비면 저장할 수 없다', () => {
    open();
    fireEvent.click(screen.getByLabelText(/값 교체/));

    fireEvent.change(screen.getByLabelText('AWS_ACCESS_KEY_ID'), { target: { value: 'a' } });

    // 빈 값으로 덮으면 조용히 못 쓰는 자격증명이 된다
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('모든 값을 채우면 저장할 수 있다', async () => {
    open();
    fireEvent.click(screen.getByLabelText(/값 교체/));
    fireEvent.change(screen.getByLabelText('AWS_ACCESS_KEY_ID'), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText('AWS_SECRET_ACCESS_KEY'), { target: { value: 'b' } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(updateCredential).toHaveBeenCalled());
    expect(updateCredential.mock.calls[0][0].credentials).toEqual({
      AWS_ACCESS_KEY_ID: 'a',
      AWS_SECRET_ACCESS_KEY: 'b',
    });
  });

  it('값 교체가 무엇을 뜻하는지 경고한다', () => {
    open();
    fireEvent.click(screen.getByLabelText(/값 교체/));

    expect(screen.getByText(/가용성 확인/)).toBeInTheDocument();
  });
});
