import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BreadCrumb,
  Button,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
} from '@innogrid/ui';
import { useGetAdminAgents } from '@/hooks/service/agents';
import type { AdminAgent, ClusterAgentStatus } from '@/types/agent';

const breadcrumbItems = [
  { label: '인프라 관리' },
  { label: '시스템 설정' },
  { label: '에이전트' },
];

const formatAge = (sec?: number): string => {
  if (sec == null) return '-';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

const STATUS_VARIANT: Record<ClusterAgentStatus, string> = {
  REGISTERING: 'ing',
  REGISTERED: 'wait',
  ACTIVE: 'run',
  DEGRADED: 'wait',
  FAILED: 'negative',
  REVOKED: 'negative',
};

const columns = [
  {
    id: 'agentId',
    header: 'Agent ID',
    accessorFn: (r: AdminAgent) => r.agentId,
    size: 240,
  },
  {
    id: 'cluster',
    header: '클러스터',
    accessorFn: (r: AdminAgent) => r.clusterName,
    size: 200,
    cell: ({ row }: { row: { original: AdminAgent } }) => (
      <Link
        to={`/infra-management/cluster-management/${encodeURIComponent(row.original.clusterName)}`}
        className="table-td-link"
      >
        {row.original.clusterName}
      </Link>
    ),
  },
  {
    id: 'agentInstanceId',
    header: 'Instance',
    accessorFn: (r: AdminAgent) => r.agentInstanceId ?? '-',
    size: 200,
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (r: AdminAgent) => r.status,
    size: 140,
    cell: ({ row }: { row: { original: AdminAgent } }) => {
      const s = row.original.status;
      const variant = STATUS_VARIANT[s] ?? 'temp';
      return <span className={`table-td-state table-td-state-${variant}`}>{s}</span>;
    },
  },
  {
    id: 'version',
    header: '버전',
    accessorFn: (r: AdminAgent) => r.agentVersion ?? '-',
    size: 100,
  },
  {
    id: 'lastSeen',
    header: 'Last seen',
    accessorFn: (r: AdminAgent) => formatAge(r.lastSeenAgeSec),
    size: 120,
  },
  {
    id: 'error',
    header: '마지막 에러',
    accessorFn: (r: AdminAgent) => r.lastError ?? '',
    size: 280,
    cell: ({ row }: { row: { original: AdminAgent } }) => {
      const msg = row.original.lastError;
      if (!msg) return '-';
      const truncated = msg.length > 50 ? msg.slice(0, 50) + '…' : msg;
      return <span title={msg}>{truncated}</span>;
    },
  },
];

export default function ClusterAgentFleetPage() {
  const navigate = useNavigate();
  const { searchValue, ...searchProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();

  const { agents, isPending, isError, error, refetch, isFetching } = useGetAdminAgents();

  const filteredAgents = useMemo(() => {
    if (!searchValue) return agents;
    const needle = searchValue.toLowerCase();
    return agents.filter((a) => {
      const fields = [a.agentId, a.clusterName, a.agentInstanceId, a.status, a.agentVersion];
      return fields.some((f) => f?.toLowerCase().includes(needle));
    });
  }, [agents, searchValue]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  const paginatedAgents = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredAgents.slice(start, end);
  }, [filteredAgents, pagination.pageIndex, pagination.pageSize]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">에이전트</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button size="small" color="secondary" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? '조회 중...' : '새로고침'}
            </Button>
          </div>
          <div>
            <SearchInput
              variant="default"
              placeholder="agentId / cluster / instance / 상태 / 버전 검색"
              {...searchProps}
            />
          </div>
        </div>
        <div className="h-[600px]">
          <Table
            columns={columns}
            data={paginatedAgents}
            isLoading={isPending}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
                <div>검색 조건을 변경해 보세요.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                <div className="flex flex-col items-center gap-2">
                  <div>에이전트 목록을 불러올 수 없습니다.</div>
                  {error instanceof Error && <div>{error.message}</div>}
                </div>
              ) : (
                <div>등록된 클러스터 에이전트가 없습니다.</div>
              )
            }
            totalCount={filteredAgents.length}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>
    </main>
  );
}
