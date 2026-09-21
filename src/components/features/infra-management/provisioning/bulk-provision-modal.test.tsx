import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BulkProvisionModal } from './bulk-provision-modal';

const createVm = vi.fn();
const byProvider = vi.fn();

vi.mock('@/hooks/service/providers', () => ({
  useGetProvisioningDefaults: (provider?: string, filter?: unknown) => byProvider(provider, filter),
}));
vi.mock('@/hooks/service/vms', () => ({
  useCreateVm: () => ({ createVm }),
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

const AWS = {
  provider: 'AWS',
  displayName: 'AWS',
  ready: true,
  region: 'ap-northeast-2',
  credentialId: 'cred-aws',
  credentialName: 'aws-e2e-02',
  masterInstanceType: 't3.large',
  workerInstanceType: 't3.large',
  vcpu: 2,
  memoryGb: 8,
  gpuCount: 0,
  providerSpec: {},
};
const OCI_BLOCKED = {
  provider: 'OCI',
  displayName: 'OCI',
  ready: false,
  blockedReason: 'ap-tokyo-1 에 자리가 없습니다.',
};

const resolved = (item: unknown) => ({ defaults: item ? [item] : [], isPending: false, isError: false });
const loading = { defaults: [], isPending: true, isError: false };

describe('CSP 일괄 프로비저닝 모달', () => {
  beforeEach(() => {
    createVm.mockReset();
    createVm.mockImplementation((_req, opts) => opts?.onSuccess?.({}));
    byProvider.mockImplementation((provider?: string) => {
      if (provider === 'AWS') return resolved(AWS);
      if (provider === 'OCI') return resolved(OCI_BLOCKED);
      return resolved(null);
    });
  });

  const row = (provider: string) => screen.getByTestId(`bulk-row-${provider}`);

  it('아직 못 받은 줄은 조회 중으로 남는다', () => {
    // 7종을 한 번에 물으면 가장 느린 CSP 가 끝날 때까지 화면이 멈춘 것처럼 보인다.
    byProvider.mockImplementation((provider?: string) =>
      provider === 'AWS' ? resolved(AWS) : loading
    );
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    expect(within(row('AWS')).getByText('준비됨')).toBeInTheDocument();
    expect(within(row('OCI')).getByText('조회 중')).toBeInTheDocument();
  });

  it('사양과 자격증명, 노드 수를 함께 보여준다', () => {
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    const aws = within(row('AWS'));
    expect(aws.getByText('t3.large')).toBeInTheDocument();
    expect(aws.getByText('2 vCPU · 8 GB')).toBeInTheDocument();
    // 어느 계정에 과금되는지가 여기서 갈린다.
    expect(aws.getByText('aws-e2e-02')).toBeInTheDocument();
    expect(aws.getByText('master 1 · worker 1')).toBeInTheDocument();
  });

  it('만들 수 없는 CSP 는 고를 수 없고 이유를 보여준다', () => {
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    expect(screen.getByLabelText('OCI 선택')).toBeDisabled();
    expect(within(row('OCI')).getByText('ap-tokyo-1 에 자리가 없습니다.')).toBeInTheDocument();
    expect(screen.getByLabelText('AWS 선택')).toBeChecked();
  });

  it('접두를 다시 입력하기 전에는 생성할 수 없다', async () => {
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /1종 생성/ }));

    expect(createVm).not.toHaveBeenCalled();
  });

  it('확인을 마치면 고른 CSP 만 백엔드 기본값 그대로 보낸다', async () => {
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('위 접두를 그대로 입력'), 'e2e-');
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

  it('조건을 바꾸면 그 조건으로 다시 묻는다', async () => {
    /*
     * 값을 화면에서 거르면 "조건에 맞는 것이 없다" 와 "그 CSP 에 자리가 없다" 를 구분할 수
     * 없다. 용량 확인도 이 조건으로 돌아야 한다.
     */
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);
    byProvider.mockClear();

    await user.click(screen.getByLabelText('GPU 인스턴스'));

    const calls = byProvider.mock.calls.filter(([, filter]) => (filter as { gpu?: boolean })?.gpu);
    expect(calls.length, 'GPU 조건으로 다시 묻지 않았다').toBeGreaterThan(0);
  });

  it('실패한 CSP 가 어느 것인지 남는다', async () => {
    createVm.mockImplementation((_req, opts) => opts?.onError?.(new Error('boom')));
    const user = userEvent.setup();
    render(<BulkProvisionModal isOpen onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('위 접두를 그대로 입력'), 'e2e-');
    await user.click(screen.getByRole('button', { name: /1종 생성/ }));

    await waitFor(() => expect(within(row('AWS')).getByText('요청 실패')).toBeInTheDocument());
  });
});
