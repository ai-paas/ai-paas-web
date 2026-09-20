import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BulkProvisionModal } from './bulk-provision-modal';

const createVm = vi.fn();
const defaults = vi.fn();

vi.mock('@/hooks/service/providers', () => ({
  useGetProvisioningDefaults: () => defaults(),
}));
vi.mock('@/hooks/service/vms', () => ({
  useCreateVm: () => ({ createVm }),
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

const READY = {
  provider: 'AWS',
  displayName: 'AWS',
  ready: true,
  region: 'ap-northeast-2',
  credentialId: 'cred-aws',
  masterInstanceType: 't3.large',
  workerInstanceType: 't3.large',
  providerSpec: {},
};
const BLOCKED = {
  provider: 'OCI',
  displayName: 'OCI',
  ready: false,
  blockedReason: 'ap-tokyo-1 에 자리가 없습니다.',
};

describe('CSP 일괄 프로비저닝 모달', () => {
  beforeEach(() => {
    createVm.mockReset();
    createVm.mockImplementation((_req, opts) => opts?.onSuccess?.({}));
    defaults.mockReturnValue({ defaults: [READY, BLOCKED], isPending: false, isError: false });
  });

  const confirmPrefix = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByPlaceholderText('위 접두를 그대로 입력'), 'e2e-');
  };

  it('만들 수 없는 CSP 는 고를 수 없고 이유를 보여준다', () => {
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    expect(screen.getByLabelText('OCI 선택')).toBeDisabled();
    expect(screen.getByText('ap-tokyo-1 에 자리가 없습니다.')).toBeInTheDocument();
    // 만들 수 있는 것만 미리 켜 둔다.
    expect(screen.getByLabelText('AWS 선택')).toBeChecked();
  });

  it('접두를 다시 입력하기 전에는 생성할 수 없다', async () => {
    // 오클릭 한 번으로 여러 CSP 가 올라가면 되돌리기 어렵다.
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /1종 생성/ }));

    expect(createVm).not.toHaveBeenCalled();
  });

  it('확인을 마치면 고른 CSP 만 백엔드 기본값 그대로 보낸다', async () => {
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await confirmPrefix(user);
    await user.click(screen.getByRole('button', { name: /1종 생성/ }));

    await waitFor(() => expect(createVm).toHaveBeenCalledTimes(1));
    expect(createVm.mock.calls[0][0]).toMatchObject({
      vmGroupName: 'e2e-aws',
      provider: 'aws',
      region: 'ap-northeast-2',
      credentialId: 'cred-aws',
      spec: { masterCount: 1, workerCount: 1, masterInstanceType: 't3.large' },
    });
  });

  it('실패한 CSP 가 어느 것인지 남는다', async () => {
    createVm.mockImplementation((_req, opts) => opts?.onError?.(new Error('boom')));
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await confirmPrefix(user);
    await user.click(screen.getByRole('button', { name: /1종 생성/ }));

    await waitFor(() => expect(screen.getByText('요청 실패')).toBeInTheDocument());
  });
});
