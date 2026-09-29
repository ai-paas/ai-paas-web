import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CredentialValuesModal } from './credential-values-modal';

const revealCredential = vi.fn();
vi.mock('@/hooks/service/credentials', () => ({
  revealCredential: (id: string) => revealCredential(id),
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

const KEYS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];

const open = () =>
  render(
    <CredentialValuesModal
      isOpen
      credentialId="cred-1"
      credentialName="aws-e2e-01"
      keys={KEYS}
      onClose={vi.fn()}
    />
  );

describe('CredentialValuesModal', () => {
  beforeEach(() => {
    revealCredential.mockReset();
    revealCredential.mockResolvedValue({
      AWS_ACCESS_KEY_ID: 'AKIA-visible',
      AWS_SECRET_ACCESS_KEY: 'secret-visible',
    });
  });

  it('열자마자 값을 부르지 않는다', () => {
    // 창을 열었다는 이유만으로 감사 로그에 열람 기록이 남으면 안 된다.
    open();

    expect(revealCredential).not.toHaveBeenCalled();
    expect(screen.queryByText('AKIA-visible')).not.toBeInTheDocument();
  });

  it('키 이름은 값 없이 모두 보여준다', () => {
    open();

    KEYS.forEach((k) => expect(screen.getByText(k)).toBeInTheDocument());
  });

  it('보기를 눌러야 그 키의 값이 드러난다', async () => {
    open();

    fireEvent.click(screen.getAllByRole('button', { name: '보기' })[0]);

    expect(await screen.findByText('AKIA-visible')).toBeInTheDocument();
    // 누르지 않은 키는 여전히 가려져 있다
    expect(screen.queryByText('secret-visible')).not.toBeInTheDocument();
  });

  it('가리기를 누르면 다시 감춘다', async () => {
    open();
    fireEvent.click(screen.getAllByRole('button', { name: '보기' })[0]);
    expect(await screen.findByText('AKIA-visible')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '가리기' }));

    await waitFor(() => expect(screen.queryByText('AKIA-visible')).not.toBeInTheDocument());
  });

  it('닫혀 있으면 아무것도 그리지 않는다', () => {
    render(
      <CredentialValuesModal
        isOpen={false}
        credentialId="cred-1"
        credentialName="aws-e2e-01"
        keys={KEYS}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText('AWS_ACCESS_KEY_ID')).not.toBeInTheDocument();
  });
});
