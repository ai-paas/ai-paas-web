import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesNodes } from '@/hooks/service/clusters';
import type { KubernetesNode } from '@/types/cluster';

interface NodesTabProps {
  clusterName?: string | null;
}

export const NodesTab = ({ clusterName }: NodesTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 노드 데이터 가져오기
  const { nodes, isPending, isError } = useGetKubernetesNodes(clusterName || undefined);

  const columns = [
    {
      id: 'select',
      size: 50,
      header: ({ table }: { table: KubernetesNode }) => <HeaderCheckbox table={table} />,
      cell: ({ row }: { row: KubernetesNode }) => <CellCheckbox row={row} />,
      enableSorting: false,
    },
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: KubernetesNode) => row.metadata?.name || row.name || 'Unknown',
      size: 200,
    },
    {
      id: 'status',
      header: '상태',
      accessorFn: (row: KubernetesNode) => {
        // 상태를 조건에서 추출
        const conditions = row.status?.conditions || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        return readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
      },
      size: 120,
      cell: ({ row }: { row: { original: KubernetesNode } }) => {
        const conditions = row.original.status?.conditions || [];
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        const status = readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
        return (
          <span
            className={`table-td-state table-td-state-${status === 'Ready' ? 'run' : 'negative'}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'roles',
      header: '권한',
      accessorFn: (row: KubernetesNode) => {
        // 라벨에서 역할 추출
        const labels = row.metadata?.labels || {};
        const roles = [];
        if (
          labels['node-role.kubernetes.io/control-plane'] ||
          labels['node-role.kubernetes.io/master']
        ) {
          roles.push('control-plane');
        }
        if (labels['node-role.kubernetes.io/worker']) {
          roles.push('worker');
        }
        return roles.length > 0 ? roles.join(',') : 'worker';
      },
      size: 200,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesNode) => {
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
    <div className="h-[481px]">
      <Table
        columns={columns}
        data={nodes}
        isLoading={isPending}
        emptyMessage={
          isError ? (
            '노드 정보를 불러오는 데 실패했습니다.'
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div>노드가 없습니다.</div>
              <div>클러스터에 노드가 생성되지 않았습니다.</div>
            </div>
          )
        }
        totalCount={nodes.length}
        pagination={pagination}
        setPagination={setPagination}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};
