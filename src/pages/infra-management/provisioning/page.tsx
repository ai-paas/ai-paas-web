import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BreadCrumb,
  Button,
  Checkbox,
  Table,
  useTablePagination,
  useTableSelection,
  useToast,
} from '@innogrid/ui';
import {
  useGetVms,
  downloadVmKubeconfig,
  useIssueVmSshKey,
  useDeleteVm,
} from '@/hooks/service/vms';
import { useState } from 'react';
import { AlertDialog } from '@innogrid/ui';
import { formatDateTime } from '@/util/date';
import type { Vm } from '@/types/vm';

const stateColor = (status?: string): 'run' | 'negative' | 'wait' => {
  if (!status) return 'wait';
  if (status === 'READY') return 'run';
  if (status === 'FAILED' || status === 'BLOCKED' || status === 'DELETED') return 'negative';
  return 'wait';
};

const workflowStepLabel = (step?: string): string => {
  switch (step) {
    case 'PROVISION':
      return 'VM 프로비저닝';
    case 'BOOTSTRAP':
      return 'Kubernetes 부트스트랩';
    case 'VERIFY':
      return '연결 확인';
    case 'DESTROY':
      return '제거';
    default:
      return step ?? '-';
  }
};

export default function ProvisioningPage() {
  const navigate = useNavigate();
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const [showDeleted, setShowDeleted] = useState(false);
  // 기본: active row 만 (anycloud 가 status 미지정 시 DELETED 자동 제외). 토글 ON 시 DELETED row 표시.
  const { vms, isPending, isError } = useGetVms(showDeleted ? { status: 'DELETED' } : {});
  const { open } = useToast();

  // 다중 선택 지원. kubeconfig/SSH 키 = 단일일 때만, 삭제 = N개 일괄.
  const selectedVms = useMemo<Vm[]>(() => {
    return Object.keys(rowSelection)
      .map((idx) => vms[parseInt(idx, 10)])
      .filter((v): v is Vm => !!v);
  }, [vms, rowSelection]);
  const selectedVm: Vm | undefined = selectedVms.length === 1 ? selectedVms[0] : undefined;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(0);
  const { deleteVm } = useDeleteVm({
    onSuccess: () =>
      setDeletePending((c) => {
        const next = c - 1;
        if (next <= 0) setIsDeleteOpen(false);
        return next;
      }),
    onError: () => setDeletePending((c) => Math.max(0, c - 1)),
  });

  const handleConfirmDelete = () => {
    if (selectedVms.length === 0) return;
    setDeletePending(selectedVms.length);
    selectedVms.forEach((v) => v.clusterName && deleteVm(v.clusterName));
  };

  const { issueSshKey, isPending: isIssuingKey } = useIssueVmSshKey({
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedVm?.clusterName ?? 'ssh-key'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      open({ title: 'SSH 키 정보가 다운로드되었습니다.' });
    },
    onError: () => open({ title: 'SSH 키 발급에 실패했습니다.', status: 'negative' }),
  });

  const handleDownloadKubeconfig = async () => {
    if (!selectedVm?.clusterName) return;
    try {
      await downloadVmKubeconfig(selectedVm.clusterName);
      open({ title: 'kubeconfig 가 다운로드되었습니다.' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'kubeconfig 다운로드에 실패했습니다.';
      open({ title: msg, status: 'negative' });
    }
  };

  const handleIssueSshKey = () => {
    if (!selectedVm?.clusterName) return;
    issueSshKey(selectedVm.clusterName);
  };

  const columns = [
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: Vm) => row.clusterName ?? '-',
      size: 220,
      cell: ({ row }: { row: { original: Vm } }) => {
        const name = row.original.clusterName ?? '';
        const linked = row.original.clusterId;
        return name ? (
          <Link
            to={
              linked
                ? `/infra-management/cluster-management/${encodeURIComponent(name)}`
                : `/infra-management/provisioning/${encodeURIComponent(name)}`
            }
            className="table-td-link"
          >
            {name}
          </Link>
        ) : (
          '-'
        );
      },
    },
    {
      id: 'provider',
      header: '프로바이더',
      accessorFn: (row: Vm) => row.clusterProvider ?? '-',
      size: 130,
    },
    {
      id: 'region',
      header: '리전',
      accessorFn: (row: Vm) => row.region ?? '-',
      size: 150,
    },
    {
      id: 'environment',
      header: '환경',
      accessorFn: (row: Vm) => row.environment ?? '-',
      size: 100,
    },
    {
      id: 'status',
      header: '상태',
      accessorFn: (row: Vm) => row.status ?? '-',
      size: 140,
      cell: ({ row }: { row: { original: Vm } }) => {
        const s = row.original.status;
        return <span className={`table-td-state table-td-state-${stateColor(s)}`}>{s ?? '-'}</span>;
      },
    },
    {
      id: 'workflow',
      header: '진행 단계',
      accessorFn: (row: Vm) => row.currentWorkflowStep ?? '-',
      size: 180,
      cell: ({ row }: { row: { original: Vm } }) => {
        const step = row.original.currentWorkflowStep ?? row.original.lastSuccessfulStep;
        return <span>{workflowStepLabel(step ?? undefined)}</span>;
      },
    },
    {
      id: 'linkedCluster',
      header: 'K8s cluster',
      accessorFn: (row: Vm) => row.clusterId ?? '-',
      size: 130,
      cell: ({ row }: { row: { original: Vm } }) => (row.original.clusterId ? '등록됨' : '대기'),
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: Vm) => formatDateTime(row.createdAt),
      size: 180,
    },
  ];

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '인프라 관리' }, { label: '프로비저닝' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">프로비저닝</h2>
      </div>
      <div className="page-content page-pb-40">

        <div className="page-toolBox" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="page-toolBox-btns" style={{ display: 'flex', gap: 8 }}>
            <Button
              color="primary"
              onClick={() => navigate('/infra-management/provisioning/create')}
            >
              VM 프로비저닝 생성
            </Button>
            <Button color="secondary" onClick={handleDownloadKubeconfig} disabled={!selectedVm}>
              kubeconfig 다운로드
            </Button>
            <Button
              color="secondary"
              onClick={handleIssueSshKey}
              disabled={!selectedVm || isIssuingKey}
            >
              {isIssuingKey ? 'SSH 키 발급 중...' : 'SSH 키 발급'}
            </Button>
            <Button
              color="negative"
              onClick={() => setIsDeleteOpen(true)}
              disabled={selectedVms.length === 0 || deletePending > 0}
            >
              {deletePending > 0
                ? `삭제 중... (${deletePending})`
                : selectedVms.length > 1
                  ? `삭제 (${selectedVms.length})`
                  : '삭제'}
            </Button>
          </div>
          <Checkbox
            id="vm-show-deleted"
            label="삭제됨 보기"
            checked={showDeleted}
            onCheckedChange={(c) => {
              setShowDeleted(c === true);
              setRowSelection({});
            }}
          />
        </div>

        <AlertDialog
          isOpen={isDeleteOpen}
          confirmButtonText="확인"
          cancelButtonText="취소"
          onClickConfirm={handleConfirmDelete}
          onClickClose={() => setIsDeleteOpen(false)}
        >
          <span>
            {selectedVms.length > 1
              ? `선택된 ${selectedVms.length}개 VM 을 삭제하시겠습니까? (Pulumi destroy 가 실행됩니다)`
              : 'VM 을 삭제하시겠습니까? (Pulumi destroy 가 실행됩니다)'}
          </span>
        </AlertDialog>

        <div className="h-[600px]">
          <Table
            columns={columns}
            data={vms}
            isLoading={isPending}
            emptyMessage={
              isError
                ? '프로비저닝 목록을 불러오는 데 실패했습니다.'
                : '프로비저닝된 VM 클러스터가 없습니다.'
            }
            totalCount={vms.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}
