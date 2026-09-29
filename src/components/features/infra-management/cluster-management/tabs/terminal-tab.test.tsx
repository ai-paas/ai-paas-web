import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalTab } from './terminal-tab';

const createNodeDebugPod = vi.fn();
let pending = false;

vi.mock('@/hooks/service/clusters', () => ({
  DEBUG_POD_CONTAINER: 'debug',
  useCreateNodeDebugPod: (opts: { onSuccess?: (p: unknown) => void }) => ({
    createNodeDebugPod: (vars: { clusterName: string; nodeName: string }) => {
      createNodeDebugPod(vars);
      opts?.onSuccess?.({
        clusterName: vars.clusterName,
        nodeName: vars.nodeName,
        namespace: 'kube-system',
        podName: 'anycloud-debug-abc',
      });
    },
    isPending: pending,
  }),
  useGetKubernetesNodes: () => ({
    nodes: [
      { metadata: { name: 'demo-master' } },
      { metadata: { name: 'demo-worker-1' } },
    ],
    isPending: false,
  }),
}));
vi.mock('../drawer/shell-tab', () => ({
  ShellTab: ({
    podName,
    enabled,
    initialCommand,
    autoRetry,
  }: {
    podName?: string;
    enabled: boolean;
    initialCommand?: string;
    autoRetry?: boolean;
  }) => (
    <div data-testid="shell" data-command={initialCommand} data-auto-retry={String(!!autoRetry)}>
      {enabled ? `attached:${podName}` : 'idle'}
    </div>
  ),
}));
vi.mock('@innogrid/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@innogrid/ui')>();
  return { ...actual, useToast: () => ({ open: vi.fn() }) };
});

describe('TerminalTab', () => {
  beforeEach(() => {
    createNodeDebugPod.mockReset();
    pending = false;
  });

  it('들어가자마자 파드를 만들지 않는다', () => {
    // 탭을 스쳐 지나가는 것만으로 클러스터에 파드가 생기면 안 된다.
    render(<TerminalTab clusterName="demo" />);

    expect(createNodeDebugPod).not.toHaveBeenCalled();
    expect(screen.getByTestId('shell')).toHaveTextContent('idle');
  });

  it('어떤 노드에 붙을지 고를 수 있다', () => {
    render(<TerminalTab clusterName="demo" />);

    const select = screen.getByLabelText(/노드/);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'demo-worker-1' })).toBeInTheDocument();
  });

  it('시작을 누르면 고른 노드에 파드를 만들고 붙는다', () => {
    render(<TerminalTab clusterName="demo" />);

    fireEvent.change(screen.getByLabelText(/노드/), { target: { value: 'demo-worker-1' } });
    fireEvent.click(screen.getByRole('button', { name: '터미널 시작' }));

    expect(createNodeDebugPod).toHaveBeenCalledWith(
      expect.objectContaining({ clusterName: 'demo', nodeName: 'demo-worker-1' })
    );
    expect(screen.getByTestId('shell')).toHaveTextContent('attached:anycloud-debug-abc');
  });

  it('무엇을 만드는지 먼저 알려준다', () => {
    render(<TerminalTab clusterName="demo" />);

    expect(screen.getByText(/kubectl/)).toBeInTheDocument();
  });

  it('클러스터 이름이 없으면 시작할 수 없다', () => {
    render(<TerminalTab />);

    expect(screen.getByRole('button', { name: '터미널 시작' })).toBeDisabled();
  });

  it('준비 중에는 다시 누를 수 없다', () => {
    pending = true;
    render(<TerminalTab clusterName="demo" />);

    expect(screen.getByRole('button', { name: /준비 중/ })).toBeDisabled();
  });

  it('종료하면 터미널을 접는다', () => {
    // 파드는 TTL 로 사라진다. 화면에서 붙잡고 있을 이유가 없다.
    render(<TerminalTab clusterName="demo" />);
    fireEvent.click(screen.getByRole('button', { name: '터미널 시작' }));

    fireEvent.click(screen.getByRole('button', { name: '종료' }));

    expect(screen.getByTestId('shell')).toHaveTextContent('idle');
  });

  it('붙자마자 k9s 를 띄우고 끝내면 셸이 남는다', () => {
    // k9s 만 실행하면 종료와 동시에 세션이 끊겨 kubectl 을 쓸 수 없다.
    render(<TerminalTab clusterName="demo" />);
    fireEvent.click(screen.getByText('터미널 시작'));

    expect(screen.getByTestId('shell')).toHaveAttribute('data-command', '/bin/bash,-lc,k9s; exec bash');
  });

  it('연결은 스스로 다시 시도한다', () => {
    /*
     * 파드를 방금 만든 자리에서는 컨테이너가 아직 없어 첫 시도가 거의 항상 실패한다. 사용자가
     * 연결 버튼을 눌러 가며 기다릴 일이 아니다.
     */
    render(<TerminalTab clusterName="demo" />);
    fireEvent.click(screen.getByText('터미널 시작'));

    expect(screen.getByTestId('shell')).toHaveAttribute('data-auto-retry', 'true');
  });
});
