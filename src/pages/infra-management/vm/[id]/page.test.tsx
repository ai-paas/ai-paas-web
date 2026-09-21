import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { Vm, VmNode } from '@/types/vm';
import {
  VmWorkflowProgress,
  VmOverviewTab,
  VmInstancesTab,
  VmConsoleTab,
  VmHistoryTab,
  VmFailureBanner,
} from './page';

vi.mock('@/components/features/infra-management/provisioning/workflow-stepper', () => ({
  WorkflowStepper: () => <div data-testid="stepper" />,
}));
vi.mock('@/components/features/infra-management/provisioning/live-progress', () => ({
  LiveProgress: () => null,
}));
vi.mock('@/components/features/infra-management/vm/node-ssh-terminal', () => ({
  NodeSshTerminal: ({ vmName, host }: { vmName?: string; host?: string }) => (
    <div data-testid="terminal">{`${vmName}@${host}`}</div>
  ),
}));

const vm = (over: Partial<Vm> = {}) =>
  ({
    clusterName: 'demo',
    status: 'READY',
    clusterProvider: 'OpenStack',
    region: 'kr-1',
    ...over,
  }) as Vm;

const withRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('VmOverviewTab', () => {
  it('이 VM 이 무엇이고 어디에 있는지 먼저 말한다', () => {
    withRouter(<VmOverviewTab vm={vm()} isPending={false} />);

    expect(screen.getByText('OpenStack')).toBeInTheDocument();
    expect(screen.getByText('kr-1')).toBeInTheDocument();
  });

  it('연결된 클러스터로 바로 넘어갈 수 있다', () => {
    withRouter(<VmOverviewTab vm={vm({ clusterId: 'demo-k8s' })} isPending={false} />);

    expect(screen.getByRole('link', { name: 'demo-k8s' })).toHaveAttribute(
      'href',
      '/infra-management/cluster-management/demo-k8s'
    );
  });

  it('아직 있는 자격증명이면 눌러서 갈 수 있다', () => {
    withRouter(
      <VmOverviewTab
        vm={vm({ credentialId: 'cred-1', credentialName: 'surromind-openstack' })}
        isPending={false}
        credentialExists
      />
    );

    expect(screen.getByRole('link', { name: 'surromind-openstack' })).toBeInTheDocument();
  });

  it('사라진 자격증명은 이름만 남기고 사라졌다고 말한다', () => {
    // 이름은 요청 당시의 기록이라 자격증명이 지워져도 남는다. 링크로 두면 눌러봐야 없는 걸 안다.
    withRouter(
      <VmOverviewTab
        vm={vm({ credentialId: 'cred-1', credentialName: 'surromind-openstack' })}
        isPending={false}
        credentialExists={false}
      />
    );

    expect(screen.queryByRole('link', { name: 'surromind-openstack' })).not.toBeInTheDocument();
    expect(screen.getByText(/삭제됨/)).toBeInTheDocument();
  });

  it('아직 붙지 않았으면 왜 없는지 말한다', () => {
    // 빈 칸만 두면 고장인지 진행 중인지 알 수 없다.
    withRouter(<VmOverviewTab vm={vm()} isPending={false} />);

    expect(screen.getByText(/agent 등록 전/)).toBeInTheDocument();
  });
});

describe('VmInstancesTab', () => {
  const nodes: VmNode[] = [
    { role: 'master', hostname: 'demo-master', publicIp: '1.1.1.1', privateIp: '10.0.0.1' },
    { role: 'worker', hostname: 'demo-worker-1', privateIp: '10.0.0.2' },
  ];

  it('인스턴스마다 어디로 붙는지 보여준다', () => {
    withRouter(<VmInstancesTab nodes={nodes} sshUserDefault="ubuntu" />);

    expect(screen.getByText('demo-master')).toBeInTheDocument();
    expect(screen.getByText('1.1.1.1')).toBeInTheDocument();
    expect(screen.getAllByText('ubuntu')).toHaveLength(2);
  });

  it('공인 IP 가 없는 노드도 자리를 지킨다', () => {
    // 칸이 비면 행이 깨져 어느 값이 어느 노드 것인지 헷갈린다.
    withRouter(<VmInstancesTab nodes={nodes} sshUserDefault="ubuntu" />);

    const workerRow = screen.getAllByRole('row').find((r) => within(r).queryByText('demo-worker-1'));
    expect(workerRow).toHaveTextContent('—');
  });

  it('아직 노드가 없으면 언제 생기는지 말한다', () => {
    withRouter(<VmInstancesTab nodes={[]} sshUserDefault="ubuntu" />);

    expect(screen.getByText(/PROVISION/)).toBeInTheDocument();
  });
});

describe('VmConsoleTab', () => {
  const nodes: VmNode[] = [
    { role: 'master', hostname: 'demo-master', publicIp: '1.1.1.1', privateIp: '10.0.0.1' },
    { role: 'worker', hostname: 'demo-worker-1', privateIp: '10.0.0.2' },
  ];

  it('VM 콘솔은 노드에 붙는 SSH 다', () => {
    // 이 화면의 대상은 인스턴스다. 쿠버네티스 셸은 클러스터 상세가 가진다.
    withRouter(<VmConsoleTab vmName="demo" nodes={nodes} />);

    expect(screen.getByTestId('terminal')).toHaveTextContent('demo@1.1.1.1');
  });

  it('어느 노드에 붙을지 고를 수 있다', () => {
    withRouter(<VmConsoleTab vmName="demo" nodes={nodes} />);

    expect(screen.getByRole('option', { name: /demo-worker-1/ })).toBeInTheDocument();
  });

  it('공인 IP 가 없으면 사설 IP 로 붙는다', () => {
    // 점프 호스트를 거치면 사설 IP 로만 닿는다.
    withRouter(<VmConsoleTab vmName="demo" nodes={[nodes[1]]} />);

    expect(screen.getByTestId('terminal')).toHaveTextContent('demo@10.0.0.2');
  });

  it('노드가 없으면 터미널 대신 이유를 보여준다', () => {
    withRouter(<VmConsoleTab vmName="demo" nodes={[]} />);

    expect(screen.queryByTestId('terminal')).not.toBeInTheDocument();
    expect(screen.getByText(/PROVISION/)).toBeInTheDocument();
  });
});

describe('VmHistoryTab', () => {
  it('상태가 어떻게 바뀌어 왔는지 보여준다', () => {
    withRouter(
      <VmHistoryTab
        items={[{ createdAt: '2026-09-16T00:00:00Z', fromStatus: 'PROVISIONING', toStatus: 'READY' }]}
      />
    );

    expect(screen.getByText('PROVISIONING')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
  });

  it('이력이 없으면 비어 있다고 말한다', () => {
    withRouter(<VmHistoryTab items={[]} />);

    expect(screen.getByText('이력 없음')).toBeInTheDocument();
  });
});

describe('VmFailureBanner', () => {
  it('실패는 탭 뒤에 숨지 않는다', () => {
    // 인스턴스 탭을 보고 있는 사이에 실패하면 개요 탭으로 돌아가야만 알 수 있다.
    withRouter(
      <VmFailureBanner
        vm={vm({ status: 'FAILED', lastFailedStep: 'BOOTSTRAP', lastError: '노드에 닿지 못함' })}
      />
    );

    expect(screen.getByText(/노드에 닿지 못함/)).toBeInTheDocument();
  });

  it('아는 실패면 원인과 할 일을 먼저 보여준다', () => {
    /*
     * 원문은 Pulumi stdout 수백 줄이다. 그 안에서 "Out of host capacity" 한 조각을 찾아내는
     * 것은 이 시스템을 만든 사람만 할 수 있다.
     */
    withRouter(
      <VmFailureBanner
        vm={vm({
          status: 'FAILED',
          lastFailedStep: 'PROVISION',
          lastError: 'Pulumi automation up failed: ... Out of host capacity. ...',
          lastErrorSummary: '선택한 리전에 지금 만들 수 있는 자리가 없습니다.',
          lastErrorHint: '다른 인스턴스 타입이나 리전을 고르세요.',
        })}
      />
    );

    expect(screen.getByText('선택한 리전에 지금 만들 수 있는 자리가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('다른 인스턴스 타입이나 리전을 고르세요.')).toBeInTheDocument();
    // 원문은 지우지 않고 접어 둔다.
    expect(screen.getByText('원본 메시지')).toBeInTheDocument();
  });

  it('모르는 실패는 원문을 그대로 펼쳐 볼 수 있다', () => {
    withRouter(
      <VmFailureBanner
        vm={vm({ status: 'FAILED', lastFailedStep: 'BOOTSTRAP', lastError: '처음 보는 오류' })}
      />
    );

    expect(screen.getByText('오류 내용')).toBeInTheDocument();
    expect(screen.getByText('처음 보는 오류')).toBeInTheDocument();
  });

  it('멀쩡할 때는 아무것도 차지하지 않는다', () => {
    const { container } = withRouter(<VmFailureBanner vm={vm()} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('VmWorkflowProgress', () => {
  it('진행 중이면 어디까지 왔는지 보여준다', () => {
    withRouter(<VmWorkflowProgress vm={vm({ status: 'BOOTSTRAPPING' })} />);

    expect(screen.getByTestId('stepper')).toBeInTheDocument();
  });

  it('끝나면 스텝을 접는다', () => {
    // READY 인 자원 위에 4단계 진행 막대가 계속 있으면 상세를 열 때마다 끝난 일을 먼저 읽게 된다.
    const { container } = withRouter(<VmWorkflowProgress vm={vm({ status: 'READY' })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('삭제된 자원도 접는다', () => {
    const { container } = withRouter(<VmWorkflowProgress vm={vm({ status: 'DELETED' })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('실패는 어디서 멈췄는지 봐야 하므로 남긴다', () => {
    // 사유는 배너가 말하지만 순서 중 어디였는지는 스텝만 보여준다.
    withRouter(<VmWorkflowProgress vm={vm({ status: 'FAILED' })} />);

    expect(screen.getByTestId('stepper')).toBeInTheDocument();
  });
});
