import { useEffect, useMemo } from 'react';
import { clusterStatusTone } from '@/util/status-tone';
import { Link } from 'react-router';
import {
  BreadCrumb,
  SearchInput,
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
  useSearchInputState,
} from '@innogrid/ui';

import { EditClusterButton } from '@/components/features/infra-management/cluster-management/edit-cluster-button';
import { CreateClusterButton } from '@/components/features/infra-management/cluster-management/create-cluster-button';
import { DeleteClusterButton } from '@/components/features/infra-management/cluster-management/delete-cluster-button';
import { formatDateTime } from '@/util/date';
import { nodeSummaryLabel } from '@/util/node-summary';
import { useGetClusters } from '@/hooks/service/clusters';
import type { Cluster, ClusterSource } from '@/types/cluster';

// 클러스터의 식별자 (라우팅 / 선택 / API 호출 등 모든 곳에서 사용)
const clusterKey = (cluster: Cluster | undefined): string => cluster?.clusterName ?? '';

// 상태 → 표시 색상
const connectivityColor = (connectivity?: string): 'run' | 'negative' | 'wait' => {
  if (connectivity === 'CONNECTED') return 'run';
  if (connectivity === 'DISCONNECTED' || connectivity === 'NOT_REGISTERED') return 'negative';
  return 'wait';
};

const SOURCE_LABEL: Record<ClusterSource, string> = {
  vm: 'VM 프로비저닝',
  registered: '에이전트 등록',
};

// 백엔드가 합치기 전 응답을 주거나 옛 캐시가 남아 있으면 sources 가 비어 있다.
const sourcesOf = (cluster: Cluster): ClusterSource[] =>
  cluster.sources?.length ? cluster.sources : cluster.source ? [cluster.source] : [];

// 테이블 컬럼 설정
const columns = [
  {
    id: 'select',
    size: 50,
    header: ({ table }: { table: Cluster }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Cluster }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Cluster) => clusterKey(row),
    size: 220,
    cell: ({ row }: { row: { original: Cluster } }) => {
      const name = clusterKey(row.original);
      return (
        <Link
          to={`/infra-management/cluster-management/${encodeURIComponent(name)}`}
          className="table-td-link"
        >
          {name || '-'}
        </Link>
      );
    },
  },
  {
    id: 'source',
    header: '출처',
    accessorFn: (row: Cluster) => sourcesOf(row).join(','),
    size: 200,
    cell: ({ row }: { row: { original: Cluster } }) => {
      const sources = sourcesOf(row.original);
      const linked = row.original.linkedVmName;
      if (sources.length === 0) return '-';
      return (
        <span className="table-td-badges">
          {sources.map((s) =>
            s === 'vm' && linked ? (
              <Link
                key={s}
                to={`/infra-management/vm/${encodeURIComponent(linked)}`}
                className="table-td-badge table-td-link"
                title="이 클러스터를 만든 프로비저닝 작업으로 이동"
              >
                {SOURCE_LABEL.vm}
              </Link>
            ) : (
              <span key={s} className="table-td-badge">
                {SOURCE_LABEL[s]}
              </span>
            )
          )}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (row: Cluster) => row.status ?? '-',
    size: 140,
    cell: ({ row }: { row: { original: Cluster } }) => {
      const s = row.original.status;
      return (
        <span className={`table-td-state table-td-state-${clusterStatusTone(s)}`}>{s ?? '-'}</span>
      );
    },
  },
  {
    id: 'connectivity',
    header: '연동 상태',
    accessorFn: (row: Cluster) => row.agentConnectivity ?? '-',
    size: 150,
    cell: ({ row }: { row: { original: Cluster } }) => {
      const c = row.original.agentConnectivity;
      if (!c) return '-';
      return <span className={`table-td-state table-td-state-${connectivityColor(c)}`}>{c}</span>;
    },
  },
  {
    id: 'master',
    header: 'master',
    // 목록은 worker 행을 따로 보여주지 않는다. master 주소가 클러스터의 대표 주소다.
    accessorFn: (row: Cluster) => row.masterPrivateIp ?? '-',
    size: 140,
  },
  {
    id: 'nodes',
    header: '노드',
    accessorFn: (row: Cluster) => nodeSummaryLabel(row.masterCount, row.workerCount),
    size: 160,
  },
  {
    id: 'provider',
    header: '프로바이더',
    accessorFn: (row: Cluster) => row.provider ?? '-',
    size: 130,
  },
  {
    id: 'region',
    header: '리전',
    accessorFn: (row: Cluster) => row.region ?? '-',
    size: 150,
  },
  {
    id: 'createdAt',
    header: '생성 일시',
    accessorFn: (row: Cluster) => formatDateTime(row.createdAt),
    size: 180,
  },
];

export default function ClusterManagementPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { clusters: allClusters, isPending, isError } = useGetClusters();

  const filteredClusters = useMemo(() => {
    if (!searchValue) return allClusters;

    const needle = searchValue.toLowerCase();
    return allClusters.filter((cluster) => {
      const fields = [
        cluster.clusterName,
        cluster.provider,
        cluster.region,
        cluster.status,
        cluster.source,
      ];
      return fields.some((field) => field?.toLowerCase().includes(needle));
    });
  }, [allClusters, searchValue]);

  // 클라이언트 사이드 페이지네이션
  const clusters = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredClusters.slice(startIndex, endIndex);
  }, [filteredClusters, pagination.pageIndex, pagination.pageSize]);

  // 선택된 행 — 다중 선택 지원. 편집은 단일일 때만 활성, 삭제는 N개 일괄.
  const selectedIds = useMemo<string[]>(() => {
    return Object.keys(rowSelection)
      .map((idx) => clusterKey(clusters[parseInt(idx)]))
      .filter((id): id is string => !!id);
  }, [rowSelection, clusters]);

  const singleSelectedId: string | null = selectedIds.length === 1 ? selectedIds[0] : null;

  // 검색어가 변경되면 페이지네이션 초기화
  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  // 삭제 성공 시 체크박스 선택 상태 초기화
  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

  // 삭제가 무엇을 데려가는지 숫자로 보여준다. worker 가 함께 사라지는 것을 모르면 사고가 난다.
  const singleSelectedCluster = useMemo(
    () => (singleSelectedId ? clusters.find((c) => clusterKey(c) === singleSelectedId) : undefined),
    [singleSelectedId, clusters]
  );
  const deleteConsequence =
    singleSelectedCluster && typeof singleSelectedCluster.masterCount === 'number'
      ? `master ${singleSelectedCluster.masterCount}대와 worker ${singleSelectedCluster.workerCount ?? 0}대가 모두 삭제되고, 클라우드의 네트워크와 디스크 자원도 함께 제거됩니다.`
      : undefined;

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '인프라 관리' }, { label: '클러스터 관리' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">클러스터 관리</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateClusterButton />
            <EditClusterButton clusterId={singleSelectedId} />
            <DeleteClusterButton
              clusterIds={selectedIds}
              consequence={deleteConsequence}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={clusters}
            isLoading={isPending}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
                <div>검색 필터 또는 검색 조건을 변경해 보세요.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                '클러스터 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>클러스터가 없습니다.</div>
                  <div>
                    수동 등록은 "등록" 버튼, VM 프로비저닝은 VM 메뉴에서 가능합니다.
                  </div>
                </div>
              )
            }
            totalCount={filteredClusters.length}
            pagination={pagination}
            setPagination={setPagination}
            useSelect
            useMultiSelect
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}