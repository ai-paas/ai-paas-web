import { useEffect, useState } from 'react';
import { Tooltip } from '@innogrid/ui';
import { useActiveClusterOperation } from '@/hooks/service/operations';
import { formatDurationSince } from '@/util/date';
import { workflowStepLabel } from '@/util/provisioning-labels';
import type { Vm } from '@/types/vm';

/** 더 진행되지 않는 상태 — 여기서 경과 시간을 세면 끝난 작업이 도는 것처럼 보인다. */
const SETTLED = new Set(['READY', 'DELETED', 'FAILED', 'BLOCKED']);

interface Props {
  vm?: Vm;
  /** vm 을 못 찾았을 때 대신 보여줄 상태 문자열. */
  status?: string;
}

/**
 * 인프라 상태 배지에 붙는 상세.
 *
 * <p>목록에서는 "PROVISIONING" 한 단어만 보여 20분째 무엇을 기다리는지 알 수 없었다. 어느 단계에서
 * 얼마나 있었는지, 실패했다면 왜인지를 붙인다.
 *
 * <p>진행률은 operation 에만 있다. 모든 행이 조회하면 목록 한 번에 수십 번 나가므로, 이 컴포넌트가
 * 뜬 동안 — 즉 마우스를 올린 행에 대해서만 묻는다.
 */
export const InfraProgressDetail = ({ vm, status }: Props) => {
  const settled = SETTLED.has(String(vm?.status ?? status ?? '').toUpperCase());
  const failed = vm?.status === 'FAILED' || vm?.status === 'BLOCKED';

  const { operation } = useActiveClusterOperation(settled ? undefined : vm?.clusterName);

  // 초 단위 값이라 한 번 그리고 멈추면 멈춘 것처럼 보인다. 떠 있는 동안만 돈다.
  const [, tick] = useState(0);
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [settled]);

  if (failed) {
    return (
      <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600 }}>
          {workflowStepLabel(vm?.lastFailedStep ?? undefined)} 단계에서 멈춤
        </div>
        {vm?.lastErrorCode && <div style={{ opacity: 0.8 }}>{vm.lastErrorCode}</div>}
        {vm?.lastError && <div style={{ marginTop: 2 }}>{vm.lastError}</div>}
      </div>
    );
  }

  const step = vm?.currentSubStep ?? workflowStepLabel(vm?.currentWorkflowStep ?? undefined);
  const elapsed = settled ? '' : formatDurationSince(vm?.subStepStartedAt ?? vm?.stepStartedAt);
  const percent = operation?.progress?.percent;

  if (!vm) {
    return <div style={{ fontSize: 12 }}>{status ?? '-'}</div>;
  }

  return (
    <div style={{ maxWidth: 320, fontSize: 12, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 600 }}>{step || String(vm.status ?? '-')}</div>
      {vm.currentSubStep && vm.currentWorkflowStep && (
        <div style={{ opacity: 0.8 }}>{workflowStepLabel(vm.currentWorkflowStep)}</div>
      )}
      {(percent !== undefined || elapsed) && (
        <div style={{ marginTop: 2 }}>
          {percent !== undefined && <span>{percent}%</span>}
          {percent !== undefined && elapsed && <span> · </span>}
          {elapsed && <span>{elapsed} 경과</span>}
        </div>
      )}
    </div>
  );
};

/** 배지를 감싸 마우스를 올리면 상세를 띄운다. */
export const InfraProgressTooltip = ({
  vm,
  status,
  children,
}: Props & { children: React.ReactNode }) => (
  <Tooltip content={<InfraProgressDetail vm={vm} status={status} />} side="top" delayDuration={150}>
    <span style={{ display: 'inline-flex' }}>{children}</span>
  </Tooltip>
);
