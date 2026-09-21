import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BreadCrumb,
  Button,
  CellCheckbox,
  HeaderCheckbox,
  Table,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { useGetClusterNodes, useGetVms } from '@/hooks/service/vms';
import { useGetKubernetesNodesByCluster } from '@/hooks/service/clusters';
import { StatusBadge } from '@/components/ui/status-badge';
import { clusterStatusTone } from '@/util/status-tone';
import { kubernetesStatusOf, type StatusTone as NodeTone } from '@/util/node-status';
import { regionLabel } from '@/util/region-labels';
import { mergeVmRows, type VmRow } from '@/util/vm-rows';
import { InfraProgressTooltip } from '@/components/features/infra-management/provisioning/infra-progress';
import { BulkProvisionModal } from '@/components/features/infra-management/provisioning/bulk-provision-modal';
import { syncDevToolsFromUrl } from '@/util/dev-tools';
import { hasVmInProgress } from '@/util/vm-progress';

// 인프라 상태와 쿠버네티스 상태는 출처가 다르다. 한 칸에 합치면 어느 쪽이 문제인지 알 수 없다.
const BADGE_TONE: Record<NodeTone, 'run' | 'ing' | 'temp' | 'negative'> = {
  positive: 'run',
  wait: 'ing',
  neutral: 'temp',
  negative: 'negative',
};

export default function VmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  /*
   * 검증용 일괄 생성은 평소에 보이지 않는다. 주소에 스위치를 달았을 때만 노출한다 —
   * 토큰은 번들에 들어가므로 접근 통제가 아니라 숨김이다.
   */
  const [devTools, setDevTools] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  useEffect(() => setDevTools(syncDevToolsFromUrl(location.search)), [location.search]);
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { vms } = useGetVms();
  /*
   * 만들어지는 중인 클러스터가 있으면 노드도 같이 따라간다. 노드는 PROVISION 이 끝나야
   * 생겨서, 클러스터만 갱신하면 상태만 바뀌고 줄은 늘지 않는다.
   */
  const { nodes, isPending, isError } = useGetClusterNodes({}, hasVmInProgress(vms));
  // 노드는 PROVISION 이 끝나야 생긴다. 노드만 보여주면 프로비저닝 중이거나 실패한 클러스터가
  // 목록에서 통째로 사라진다 — 진행 중인 작업도 실패 원인도 찾아갈 길이 없다.
  const rows = useMemo(() => mergeVmRows(nodes, vms), [nodes, vms]);
  // 행은 노드지만 진행 상황은 클러스터 단위다. 행마다 되찾지 않도록 한 번 만들어 둔다.
  const vmByName = useMemo(() => new Map(vms.map((v) => [v.clusterName, v])), [vms]);

  // 에이전트에 물어볼 가치가 있는 클러스터만. PROVISIONING 중인 것에 물으면 매번 실패한다.
  const readyClusters = useMemo(
    () =>
      Array.from(
        new Set(
          nodes.filter((n) => (n.infraStatus ?? '').toUpperCase() === 'READY').map((n) => n.clusterName)
        )
      ),
    [nodes]
  );
  const { byCluster } = useGetKubernetesNodesByCluster(readyClusters);

  const selectedNodes: VmRow[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((idx) => rows[parseInt(idx, 10)])
        .filter((n): n is VmRow => !!n),
    [rows, rowSelection]
  );
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : undefined;
  const isWorker = selectedNode?.role?.toLowerCase() === 'worker';

  const columns = [
    {
      id: 'select',
      size: 40,
      enableSorting: false,
      header: ({ table }: { table: unknown }) => <HeaderCheckbox table={table} />,
      cell: ({ row }: { row: { original: VmRow } }) => <CellCheckbox row={row} />,
    },
    {
      id: 'nodeName',
      header: '이름',
      accessorFn: (row: VmRow) => row.nodeName ?? '-',
      size: 220,
      // 행의 주인공은 이름이다. 소속 클러스터를 눌러야 상세로 가는 것은 어디로 가는지 어긋난다.
      cell: ({ row }: { row: { original: VmRow } }) => {
        const { nodeName, clusterName } = row.original;
        return clusterName ? (
          <Link
            to={`/infra-management/vm/${encodeURIComponent(clusterName)}`}
            className="table-td-link"
          >
            {nodeName ?? clusterName}
          </Link>
        ) : (
          (nodeName ?? '-')
        );
      },
    },
    {
      id: 'role',
      header: '역할',
      accessorFn: (row: VmRow) => (row.pending ? '준비 중' : (row.role ?? '-')),
      size: 90,
    },
    {
      id: 'clusterName',
      header: '소속 클러스터',
      size: 200,
      accessorFn: (row: VmRow) => row.clusterName ?? '-',
    },
    {
      id: 'infraStatus',
      header: '인프라',
      size: 130,
      accessorFn: (row: VmRow) => row.infraStatus ?? '-',
      cell: ({ row }: { row: { original: VmRow } }) => (
        <InfraProgressTooltip
          vm={vmByName.get(row.original.clusterName)}
          status={row.original.infraStatus}
        >
          <StatusBadge
            label={row.original.infraStatus}
            tone={clusterStatusTone(row.original.infraStatus)}
          />
        </InfraProgressTooltip>
      ),
    },
    {
      id: 'kubernetesStatus',
      header: '쿠버네티스',
      size: 130,
      accessorFn: (row: VmRow) =>
        kubernetesStatusOf(byCluster.get(row.clusterName) ?? [], row.privateIp, row.infraStatus).label,
      cell: ({ row }: { row: { original: VmRow } }) => {
        const s = kubernetesStatusOf(
          byCluster.get(row.original.clusterName) ?? [],
          row.original.privateIp,
          row.original.infraStatus
        );
        return <StatusBadge label={s.label} tone={BADGE_TONE[s.tone]} title={s.reason} />;
      },
    },
    {
      id: 'privateIp',
      header: '사설 IP',
      accessorFn: (row: VmRow) => row.privateIp ?? '-',
      size: 140,
    },
    {
      id: 'publicIp',
      header: '공인 IP',
      accessorFn: (row: VmRow) => row.publicIp ?? '-',
      size: 140,
    },
    {
      id: 'provider',
      header: '프로바이더',
      accessorFn: (row: VmRow) => row.clusterProvider ?? '-',
      size: 120,
    },
    {
      id: 'region',
      header: '리전',
      accessorFn: (row: VmRow) => regionLabel(row.region),
      size: 160,
    },
  ];

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '인프라 관리' }, { label: 'VM' }]} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">VM</h2>
      </div>
      <div className="page-content page-pb-40">
        <div
          className="page-toolBox"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="page-toolBox-btns" style={{ display: 'flex', gap: 8 }}>
            <Button color="primary" onClick={() => navigate('/infra-management/vm/create')}>
              VM 만들기
            </Button>
            {devTools && (
              <Button color="secondary" onClick={() => setBulkOpen(true)}>
                일괄 생성 (검증용)
              </Button>
            )}
            {/*
              노드는 Pulumi 스택 단위로 관리한다. worker 하나만 지우는 경로가 없어서,
              삭제 버튼을 두면 할 수 없는 일을 할 수 있다고 오해하게 된다.
            */}
            <Button
              color="secondary"
              disabled={!selectedNode}
              onClick={() =>
                selectedNode &&
                navigate(
                  `/infra-management/vm/${encodeURIComponent(selectedNode.clusterName)}${
                    isWorker ? '?scale=1' : ''
                  }`
                )
              }
            >
              {isWorker ? '워커 수 조정' : '클러스터 상세'}
            </Button>
          </div>
          <span style={{ fontSize: 12, color: '#666' }}>
            노드는 클러스터 단위로 만들어지고 지워집니다.
          </span>
        </div>

        <div className="h-[600px]">
          <Table
            columns={columns}
            data={rows}
            totalCount={rows.length}
            isLoading={isPending}
            emptyMessage={
              isError ? '노드 목록을 불러오는 데 실패했습니다.' : '표시할 노드가 없습니다.'
            }
            pagination={pagination}
            setPagination={setPagination}
            useClientPagination
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            useSelect
          />
        </div>
      </div>
      {devTools && <BulkProvisionModal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} />}
    </main>
  );
}
