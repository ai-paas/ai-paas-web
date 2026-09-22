import { useEffect, useMemo, useState } from 'react';
import { clusterStatusTone } from '@/util/status-tone';
import { Link, useNavigate, useParams } from 'react-router';
import { BreadCrumb, Button, Tabs, useToast } from '@innogrid/ui';
import {
  useGetVm,
  useGetVmNodes,
  useGetVmStateHistory,
  useDeleteVm,
  useIssueVmSshKey,
  useRetryVmOperation,
} from '@/hooks/service/vms';
import { useGetCredentials } from '@/hooks/service/credentials';
import { formatDateTime } from '@/util/date';
import { stateReasonLabel, workflowStepLabel } from '@/util/provisioning-labels';
import type { VmNode } from '@/types/vm';
import { WorkflowStepper } from '@/components/features/infra-management/provisioning/workflow-stepper';
import { LiveProgress } from '@/components/features/infra-management/provisioning/live-progress';
import { getServerErrorMessage } from '@/lib/api';
import { DetailValue } from '@/components/ui/detail-value';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { SshAccessModal } from '@/components/features/infra-management/vm/ssh-access-modal';
import { clusterAccessNotice } from '@/util/cluster-access';
import { NodeSshTerminal } from '@/components/features/infra-management/vm/node-ssh-terminal';
import type { Vm } from '@/types/vm';

type HistoryRow = Record<string, unknown>;

const roleTone = (role?: string): 'run' | 'wait' => (/master|control/i.test(role ?? '') ? 'run' : 'wait');

/** 더 진행되지 않고 성공으로 끝난 상태 — 진행 막대를 둘 이유가 없다. */
const FINISHED = new Set(['READY', 'DELETED']);

/**
 * 프로비저닝 진행 표시.
 *
 * <p>끝난 자원 위에 4단계 막대가 계속 있으면 상세를 열 때마다 끝난 일을 먼저 읽게 된다. 남은 기록은
 * 상태 이력 탭에 있다. 실패는 남긴다 — 사유는 배너가 말하지만 순서 중 어디서 멈췄는지는 스텝만
 * 보여준다.
 */
export const VmWorkflowProgress = ({ vm, vmName }: { vm?: Vm; vmName?: string }) => {
  if (FINISHED.has(String(vm?.status ?? '').toUpperCase())) return null;

  return (
    <>
      <WorkflowStepper vm={vm} />
      <LiveProgress
        clusterName={vmName}
        fallbackStep={vm?.currentSubStep ?? workflowStepLabel(vm?.currentWorkflowStep)}
      />
    </>
  );
};

/**
 * 실패는 탭 뒤에 숨지 않는다.
 *
 * <p>인스턴스 탭을 보고 있는 사이에 실패하면 개요 탭으로 돌아가야만 알 수 있다.
 */
export const VmFailureBanner = ({ vm }: { vm?: Vm }) => {
  if (!vm || (vm.status !== 'FAILED' && vm.status !== 'BLOCKED')) return null;

  return (
    <div
      role="alert"
      style={{
        margin: '12px 0',
        padding: '10px 12px',
        border: '1px solid #f0c2c2',
        background: '#fdf3f3',
        borderRadius: 6,
        fontSize: 13,
        color: '#a33',
      }}
    >
      <strong>{workflowStepLabel(vm.lastFailedStep ?? undefined)} 단계에서 멈췄습니다</strong>
      {vm.lastErrorCode && <span> ({vm.lastErrorCode})</span>}
      {/* 아는 실패면 원인과 할 일을 먼저 보여준다. 원문은 수백 줄이라 그 안을 뒤질 수 없다. */}
      {vm.lastErrorSummary && (
        <div style={{ marginTop: 6, color: '#7a2b2b', fontWeight: 600 }}>{vm.lastErrorSummary}</div>
      )}
      {vm.lastErrorHint && <div style={{ marginTop: 2, color: '#7a2b2b' }}>{vm.lastErrorHint}</div>}
      {vm.lastError && (
        <details style={{ marginTop: 6 }}>
          {/* 분류에 없는 실패는 원문으로만 알 수 있다. 지우지 않고 접어 둔다. */}
          <summary style={{ cursor: 'pointer', color: '#7a2b2b' }}>
            {vm.lastErrorSummary ? '원본 메시지' : '오류 내용'}
          </summary>
          <div style={{ marginTop: 4, color: '#7a2b2b', whiteSpace: 'pre-wrap' }}>{vm.lastError}</div>
        </details>
      )}
    </div>
  );
};

/** 이 VM 이 무엇이고 어디에 있으며 지금 어느 단계인지. */
export const VmOverviewTab = ({
  vm,
  isPending,
  credentialExists,
}: {
  vm?: Vm;
  isPending: boolean;
  /** 이름은 요청 당시의 기록이라 자격증명이 지워져도 남는다. 살아 있을 때만 눌러 갈 수 있다. */
  credentialExists?: boolean;
}) => (
  <div className="tabs-Content" style={{ display: 'flex', gap: 24 }}>
    <div style={{ flex: 1 }}>
      <h3 className="page-detail-title">기본 정보</h3>
      <div className="page-detail-list-box">
        <ul className="page-detail-list">
          <li>
            <div className="page-detail_item-name">이름</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={160}>
                {vm?.clusterName}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">상태</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={100}>
                <span className={`table-td-state table-td-state-${clusterStatusTone(vm?.status)}`}>
                  {vm?.status ?? '-'}
                </span>
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">프로바이더</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={120}>
                {vm?.clusterProvider ?? '-'}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">리전</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={100}>
                {vm?.region ?? '-'}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">환경</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={100}>
                {vm?.environment ?? '-'}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">자격증명</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {!vm?.credentialName ? (
                  '-'
                ) : credentialExists ? (
                  <Link
                    to={`/infra-management/credentials?name=${encodeURIComponent(vm.credentialName)}`}
                    className="table-td-link"
                  >
                    {vm.credentialName}
                  </Link>
                ) : (
                  <span style={{ color: '#6b7280' }}>
                    {vm.credentialName} <span style={{ fontSize: 12 }}>(삭제됨)</span>
                  </span>
                )}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">생성일시</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {formatDateTime(vm?.createdAt)}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">최종 변경</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {formatDateTime(vm?.updatedAt)}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">연결 K8s cluster</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={160}>
                {vm?.clusterId ? (
                  <Link
                    to={`/infra-management/cluster-management/${encodeURIComponent(vm.clusterId)}`}
                    className="table-td-link"
                  >
                    {vm.clusterId}
                  </Link>
                ) : (
                  <span style={{ color: '#999' }}>대기 (agent 등록 전)</span>
                )}
              </DetailValue>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div style={{ flex: 1 }}>
      <h3 className="page-detail-title">Workflow 진행</h3>
      <div className="page-detail-list-box">
        <ul className="page-detail-list">
          <li>
            <div className="page-detail_item-name">현재 단계</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {workflowStepLabel(vm?.currentWorkflowStep ?? undefined)}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">마지막 완료</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {workflowStepLabel(vm?.lastSuccessfulStep ?? undefined)}
              </DetailValue>
            </div>
          </li>
          {vm?.currentSubStep && (
            <li>
              <div className="page-detail_item-name">세부 단계</div>
              <div className="page-detail_item-data">{vm.currentSubStep}</div>
            </li>
          )}
          <li>
            <div className="page-detail_item-name">단계 시작</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={140}>
                {formatDateTime(vm?.stepStartedAt)}
              </DetailValue>
            </div>
          </li>
          <li>
            <div className="page-detail_item-name">재시도 횟수</div>
            <div className="page-detail_item-data">
              <DetailValue isLoading={isPending} width={100}>
                {vm?.workflowRetryCount ?? 0}
              </DetailValue>
            </div>
          </li>
          {vm?.masterVmSpec && (
            <li>
              <div className="page-detail_item-name">Master 스펙</div>
              <div className="page-detail_item-data">{vm.masterVmSpec}</div>
            </li>
          )}
          {vm?.workerVmSpec && (
            <li>
              <div className="page-detail_item-name">Worker 스펙</div>
              <div className="page-detail_item-data">{vm.workerVmSpec}</div>
            </li>
          )}
          {vm?.osImage && (
            <li>
              <div className="page-detail_item-name">OS 이미지</div>
              <div className="page-detail_item-data">{vm.osImage}</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  </div>
);

/** master 와 worker 인스턴스. 조작은 'SSH 접속' 창으로 모았다 — 두 군데 있으면 어느 쪽이 최신인지 헷갈린다. */
export const VmInstancesTab = ({
  nodes,
  sshUserDefault,
}: {
  nodes: VmNode[];
  sshUserDefault: string;
}) => (
  <div className="tabs-Content">
    {nodes.length === 0 ? (
      <div
        style={{
          padding: 16,
          color: '#888',
          fontSize: 13,
          border: '1px dashed #d1d5db',
          borderRadius: 6,
        }}
      >
        노드 정보 없음 — PROVISION 단계 완료 후 표시됩니다.
      </div>
    ) : (
      <table className="w-full" style={{ fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#666' }}>
            <th style={{ padding: '6px 8px' }}>역할</th>
            <th style={{ padding: '6px 8px' }}>호스트명</th>
            <th style={{ padding: '6px 8px' }}>공인 IP</th>
            <th style={{ padding: '6px 8px' }}>사설 IP</th>
            <th style={{ padding: '6px 8px' }}>SSH user</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((n, i) => (
            <tr key={`${n.hostname ?? n.role}-${i}`} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>
                <span
                  className={`table-td-state table-td-state-${roleTone(n.role)}`}
                  style={{ fontSize: 11 }}
                >
                  {n.role ?? 'node'}
                </span>
              </td>
              <td style={{ padding: '8px' }}>{n.hostname ?? `instance-${i}`}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{n.publicIp ?? '—'}</td>
              <td style={{ padding: '8px', fontFamily: 'monospace' }}>{n.privateIp ?? '—'}</td>
              <td style={{ padding: '8px' }}>{n.sshUser ?? sshUserDefault}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/**
 * 노드에 붙는 웹 SSH 콘솔.
 *
 * <p>이 화면의 대상은 인스턴스다. kubectl, k9s 셸은 클러스터 상세가 가진다 — 같은 자리에 두면
 * 무엇에 붙는 터미널인지 헷갈린다.
 */
export const VmConsoleTab = ({ vmName, nodes }: { vmName?: string; nodes: VmNode[] }) => {
  const targets = nodes
    .map((n) => ({ host: n.publicIp ?? n.privateIp, label: n.hostname ?? n.role }))
    .filter((t): t is { host: string; label: string } => !!t.host);
  const [host, setHost] = useState('');

  // 노드는 나중에 온다. 사용자가 이미 고른 값은 덮어쓰지 않는다.
  useEffect(() => {
    if (!host && targets.length > 0) setHost(targets[0].host);
  }, [host, targets]);

  if (targets.length === 0) {
    return (
      <div className="tabs-Content">
        <div
          style={{
            padding: 16,
            color: '#888',
            fontSize: 13,
            border: '1px dashed #d1d5db',
            borderRadius: 6,
          }}
        >
          붙을 노드가 없습니다 — PROVISION 단계 완료 후 접속할 수 있습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="tabs-Content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <label htmlFor="console-node" style={{ fontSize: 13 }}>
          노드
        </label>
        <select
          id="console-node"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="rounded border border-[#d1d5db] bg-white px-2 text-[13px]"
          style={{ height: 32, minWidth: 220 }}
        >
          {targets.map((t) => (
            <option key={t.host} value={t.host}>
              {t.label} ({t.host})
            </option>
          ))}
        </select>
      </div>
      <NodeSshTerminal key={host} vmName={vmName} host={host || targets[0].host} />
    </div>
  );
};

/** 상태가 어떻게 바뀌어 왔는지. 지금 상태만으로는 어디서 시간을 썼는지 알 수 없다. */
export const VmHistoryTab = ({ items }: { items: HistoryRow[] }) => (
  <div className="tabs-Content">
    <div
      style={{
        maxHeight: 360,
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: 8,
        fontSize: 12,
        fontFamily: 'monospace',
      }}
    >
      {items.length === 0 && <div style={{ color: '#666' }}>이력 없음</div>}
      {items.map((r, idx) => (
        <div key={idx} style={{ padding: '2px 0' }}>
          <span style={{ color: '#666' }}>{formatDateTime(r.createdAt as string | undefined)}</span>{' '}
          <span>{String(r.fromStatus ?? '-')}</span>
          {' → '}
          <span style={{ fontWeight: 600 }}>{String(r.toStatus ?? '-')}</span>{' '}
          <span style={{ color: '#888' }} title={String(r.reason ?? '')}>
            {stateReasonLabel(r.reason as string | undefined)}
          </span>
          {r.valid === false && <span style={{ color: '#a33', marginLeft: 6 }}>[invalid]</span>}
        </div>
      ))}
    </div>
  </div>
);

export default function VmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { open } = useToast();
  const vmName = id;

  const { vm, isPending, refetch } = useGetVm(vmName);
  const { nodes: nodeList } = useGetVmNodes(vmName);
  const { history } = useGetVmStateHistory(vmName, 30);
  // 이름은 요청 당시의 기록이라 자격증명이 지워져도 남는다. 살아 있을 때만 링크로 보낸다.
  const { credentials } = useGetCredentials();
  const credentialExists = credentials.some((c) => c.id === vm?.credentialId);

  const { issueSshKey, isPending: isIssuingKey } = useIssueVmSshKey({
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vmName ?? 'ssh-key'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      open({ title: 'SSH 키가 다운로드되었습니다.' });
    },
    onError: (error) =>
      open({
        title: 'SSH 키 발급 실패',
        children: getServerErrorMessage(error, '잠시 후 다시 시도해주세요.'),
        status: 'negative',
      }),
  });

  const { deleteVm, isPending: isDeleting } = useDeleteVm({
    onSuccess: (orphanedStacks) => {
      if (orphanedStacks.length > 0) {
        open({
          title: `클라우드에 자원이 남아 있을 수 있습니다: ${orphanedStacks.join(', ')}`,
          status: 'negative',
        });
      } else {
        open({ title: 'VM 삭제 요청 수락됨.' });
      }
      navigate('/infra-management/vm');
    },
    onError: (error) =>
      open({
        title: 'VM 삭제 실패',
        children: getServerErrorMessage(error, '잠시 후 다시 시도해주세요.'),
        status: 'negative',
      }),
  });

  const { retryOperation, isPending: isRetrying } = useRetryVmOperation({
    onSuccess: () => {
      open({ title: 'Retry 요청 수락됨.' });
      refetch();
    },
    onError: (error) =>
      open({
        title: '재시도 실패',
        children: getServerErrorMessage(error, '잠시 후 다시 시도해주세요.'),
        status: 'negative',
      }),
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSshOpen, setIsSshOpen] = useState(false);

  const handleConfirmDelete = ({ force }: { force: boolean }) => {
    if (!vmName) return;
    deleteVm({ vmName, force });
  };

  const handleRetryWorkflow = () => {
    if (!vmName) return;
    retryOperation({ vmName, type: 'retryWorkflow' });
  };

  const nodes: VmNode[] = useMemo(() => nodeList?.nodes ?? [], [nodeList]);
  const sshUserDefault = nodeList?.sshUser ?? 'ubuntu';


  const historyItems = useMemo<HistoryRow[]>(() => {
    if (!history) return [];
    const raw = (history as { data?: unknown }).data ?? history;
    if (Array.isArray(raw)) return raw as HistoryRow[];
    if (raw && typeof raw === 'object' && 'items' in raw) {
      return ((raw as { items?: HistoryRow[] }).items ?? []) as HistoryRow[];
    }
    return [];
  }, [history]);

  const isFailed = vm?.status === 'FAILED' || vm?.status === 'BLOCKED';

  const masterCount = nodes.filter((n) => n.role?.toLowerCase() === 'master').length;
  const workerCount = nodes.length - masterCount;

  return (
    <main>
      <SshAccessModal
        isOpen={isSshOpen}
        vmName={vmName}
        nodes={nodes}
        sshUser={sshUserDefault}
        sshJump={nodeList?.sshJump}
        accessNotice={clusterAccessNotice(vm)}
        onClose={() => setIsSshOpen(false)}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        resourceType="VM"
        resourceName={vmName}
        // 삭제가 무엇을 데려가는지 숫자로 보여준다. worker 가 함께 사라지는 것을 모르면 사고가 난다.
        consequence={
          nodes.length > 0
            ? `master ${masterCount}대와 worker ${workerCount}대가 모두 삭제되고, 클라우드의 네트워크와 디스크 자원도 함께 제거됩니다.`
            : undefined
        }
        allowForce
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '인프라 관리' },
            { label: 'VM', path: '/infra-management/vm' },
            { label: vmName ?? 'VM 상세' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">VM 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns" style={{ display: 'flex', gap: 8 }}>
            <Button
              color="secondary"
              onClick={() => vmName && issueSshKey(vmName)}
              disabled={!vmName || isIssuingKey}
            >
              {isIssuingKey ? 'SSH 키 발급 중...' : 'SSH 키 발급'}
            </Button>
            <Button
              color="secondary"
              onClick={() => setIsSshOpen(true)}
              disabled={!vmName || nodes.length === 0}
              title={nodes.length === 0 ? '프로비저닝이 끝나야 접속할 수 있습니다.' : undefined}
            >
              SSH 명령
            </Button>
            {/* 읽기 전용과 상태를 바꾸는 것 사이를 벌린다. 삭제가 '보기' 바로 옆이면 오조작이 가깝다. */}
            <span style={{ width: 1, background: '#e5e7eb', margin: '0 4px' }} />
            {isFailed && (
              <Button color="secondary" onClick={handleRetryWorkflow} disabled={isRetrying}>
                {isRetrying ? '재시도 중...' : 'Workflow 재시도'}
              </Button>
            )}
            {vm?.clusterId && (
              <Button
                color="secondary"
                onClick={() =>
                  navigate(
                    `/infra-management/cluster-management/${encodeURIComponent(vm.clusterId!)}`
                  )
                }
              >
                연결된 클러스터 보기
              </Button>
            )}
            <span style={{ width: 1, background: '#e5e7eb', margin: '0 4px' }} />
            <Button
              color="negative"
              onClick={() => setIsDeleteOpen(true)}
              disabled={isDeleting || !vmName}
            >
              {isDeleting ? '삭제 중...' : 'VM 삭제'}
            </Button>
          </div>
        </div>
      </div>

      <div className="page-content page-pb-40">
        {!isPending && !vm && (
          <div style={{ padding: 16, color: '#a33' }}>VM 을 찾을 수 없습니다.</div>
        )}

        {(isPending || vm) && (
          <>
            {/* 진행 상황은 탭 밖에 둔다. 탭을 옮겼다고 "지금 뭐 하는 중인지" 가 사라지면 안 된다. */}
            <VmWorkflowProgress vm={vm} vmName={vmName} />
            <VmFailureBanner vm={vm} />

            <Tabs
              labels={[
                '개요',
                `인스턴스${nodes.length > 0 ? ` (${nodes.length})` : ''}`,
                '콘솔',
                '상태 이력',
              ]}
              components={[
                <VmOverviewTab vm={vm} isPending={isPending} credentialExists={credentialExists} />,
                <VmInstancesTab nodes={nodes} sshUserDefault={sshUserDefault} />,
                <VmConsoleTab vmName={vmName} nodes={nodes} />,
                <VmHistoryTab items={historyItems} />,
              ]}
            />
          </>
        )}
      </div>
    </main>
  );
}