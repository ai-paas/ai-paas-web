import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesPods } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesPod } from '@/types/cluster';

interface PodsTabProps {
  clusterName?: string | null;
}

export const PodsTab = ({ clusterName }: PodsTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 파드 데이터 가져오기
  const { pods, isPending, isError } = useGetKubernetesPods(clusterName || undefined);

  // 삭제 성공 시 선택 해제
  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

  const columns = [
    {
      id: 'select',
      size: 50,
      header: ({ table }: { table: KubernetesPod }) => <HeaderCheckbox table={table} />,
      cell: ({ row }: { row: KubernetesPod }) => <CellCheckbox row={row} />,
      enableSorting: false,
    },
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: KubernetesPod) => row.metadata?.name || row.name || 'Unknown',
      size: 200,
      cell: ({ row }: { row: { original: KubernetesPod } }) => (
        <span style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.original.metadata?.name || row.original.name || 'Unknown'}
        </span>
      ),
    },
    {
      id: 'status',
      header: '상태',
      accessorFn: (row: KubernetesPod) => row.status?.phase || 'Unknown',
      size: 120,
      cell: ({ row }: { row: { original: KubernetesPod } }) => {
        const status = row.original.status?.phase || 'Unknown';
        const statusClass = status === 'Running' ? 'table-td-state-run' : 'table-td-state-negative';
        return <span className={`table-td-state ${statusClass}`}>{status}</span>;
      },
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesPod) => row.metadata?.namespace || row.namespace || 'Unknown',
      size: 150,
    },
    {
      id: 'containers',
      header: '컨테이너',
      accessorFn: (row: KubernetesPod) => {
        const containerStatuses = row.status?.containerStatuses || [];
        const readyCount = containerStatuses.filter((cs) => cs.ready).length;
        const totalCount = containerStatuses.length;
        return `${readyCount}/${totalCount}`;
      },
      size: 120,
    },
    {
      id: 'restartCount',
      header: '재시작 횟수',
      accessorFn: (row: KubernetesPod) => {
        const containerStatuses = row.status?.containerStatuses || [];
        const totalRestarts = containerStatuses.reduce(
          (sum, cs) => sum + (cs.restartCount || 0),
          0
        );
        return totalRestarts.toString();
      },
      size: 120,
    },
    {
      id: 'owner',
      header: '소유자',
      accessorFn: (row: KubernetesPod) => {
        const ownerReferences = row.metadata?.ownerReferences || [];
        if (ownerReferences.length > 0) {
          const owner = ownerReferences[0];
          return `${owner.kind} / ${owner.name}`;
        }
        return '-';
      },
      size: 200,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesPod) => {
        const createdAt = row.metadata?.creationTimestamp || row.createdAt;
        if (createdAt) {
          const date = new Date(createdAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
        return '-';
      },
      size: 200,
    },
  ];

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="pod"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={pods}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '파드 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>파드가 없습니다.</div>
                <div>클러스터에 파드가 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={pods.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
