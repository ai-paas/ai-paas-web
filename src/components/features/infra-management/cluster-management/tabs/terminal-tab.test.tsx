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
  ShellTab: ({ podName, enabled }: { podName?: string; enabled: boolean }) => (
    <div data-testid="shell">{enabled ? `attached:${podName}` : 'idle'}</div>
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
});
