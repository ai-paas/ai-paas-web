import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Vm } from '@/types/vm';
import { InfraProgressDetail } from './infra-progress';

let operation: { percent?: number; currentStep?: string; state?: string } | undefined;

vi.mock('@/hooks/service/operations', () => ({
  useActiveClusterOperation: () => ({
    operation: operation
      ? { state: operation.state, progress: { percent: operation.percent, currentStep: operation.currentStep } }
      : undefined,
  }),
}));

const vm = (over: Partial<Vm> = {}) =>
  ({ clusterName: 'demo', status: 'PROVISIONING', ...over }) as Vm;

// 기준 시각을 고정한다 — 경과 시간은 초 단위라 실제 시계로는 값을 확정할 수 없다.
const NOW = new Date('2026-09-16T12:00:00Z');

describe('InfraProgressDetail', () => {
  beforeEach(() => {
    operation = undefined;
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it('지금 어느 단계인지 말한다', () => {
    render(<InfraProgressDetail vm={vm({ currentWorkflowStep: 'BOOTSTRAP' })} />);

    expect(screen.getByText(/BOOTSTRAP|부트스트랩/)).toBeInTheDocument();
  });

  it('세부 단계가 있으면 그것까지 보여준다', () => {
    // "BOOTSTRAP" 만으로는 20분째 무엇을 기다리는지 알 수 없다.
    render(
      <InfraProgressDetail
        vm={vm({ currentWorkflowStep: 'BOOTSTRAP', currentSubStep: 'BOOTSTRAP_NODES_READY' })}
      />
    );

    expect(screen.getByText(/BOOTSTRAP_NODES_READY/)).toBeInTheDocument();
  });

  it('몇 분째 진행 중인지 보여준다', () => {
    render(
      <InfraProgressDetail
        vm={vm({ currentWorkflowStep: 'BOOTSTRAP', subStepStartedAt: '2026-09-16T11:56:18Z' })}
      />
    );

    expect(screen.getByText(/3분 42초/)).toBeInTheDocument();
  });

  it('세부 단계 시작 시각이 없으면 단계 시작 시각으로 잰다', () => {
    render(
      <InfraProgressDetail
        vm={vm({ currentWorkflowStep: 'BOOTSTRAP', stepStartedAt: '2026-09-16T11:50:00Z' })}
      />
    );

    expect(screen.getByText(/10분/)).toBeInTheDocument();
  });

  it('진행률을 알 수 있으면 함께 보여준다', () => {
    operation = { percent: 64, currentStep: 'BOOTSTRAP_NODES_READY', state: 'RUNNING' };
    render(<InfraProgressDetail vm={vm()} />);

    expect(screen.getByText(/64%/)).toBeInTheDocument();
  });

  it('실패하면 단계 대신 사유를 앞세운다', () => {
    // 진행률 64% 를 계속 보여주면 아직 진행 중인 줄 안다.
    render(
      <InfraProgressDetail
        vm={vm({
          status: 'FAILED',
          lastFailedStep: 'BOOTSTRAP',
          lastErrorCode: 'SSH_UNREACHABLE',
          lastError: '노드에 닿지 못했습니다',
        })}
      />
    );

    expect(screen.getByText(/노드에 닿지 못했습니다/)).toBeInTheDocument();
    expect(screen.getByText(/SSH_UNREACHABLE/)).toBeInTheDocument();
  });

  it('끝난 자원은 경과 시간을 세지 않는다', () => {
    // READY 옆에 "3시간 경과" 가 붙으면 아직 뭔가 도는 것처럼 보인다.
    render(
      <InfraProgressDetail
        vm={vm({ status: 'READY', stepStartedAt: '2026-09-16T09:00:00Z' })}
      />
    );

    expect(screen.queryByText(/경과/)).not.toBeInTheDocument();
  });

  it('알 수 있는 게 없으면 상태만 말한다', () => {
    render(<InfraProgressDetail vm={undefined} status="READY" />);

    expect(screen.getByText('READY')).toBeInTheDocument();
  });
});
