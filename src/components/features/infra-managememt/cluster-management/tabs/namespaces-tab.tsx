import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesNamespaces } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesNamespace } from '@/types/cluster';

interface NamespacesTabProps {
  clusterName?: string | null;
}

export const NamespacesTab = ({ clusterName }: NamespacesTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 네임스페이스 데이터 가져오기
  const { namespaces, isPending, isError } = useGetKubernetesNamespaces(clusterName || undefined);

  const columns = [
    {
      id: 'select',
      size: 50,
      header: (props: { table: unknown }) => <HeaderCheckbox table={props.table} />,
      cell: (props: { row: unknown }) => <CellCheckbox row={props.row} />,
      enableSorting: false,
    },
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: KubernetesNamespace) => row.metadata.name,
      size: 200,
      cell: ({ row }: { row: { original: KubernetesNamespace } }) => (
        <a
          href="#"
          style={{ color: '#0066cc', textDecoration: 'underline' }}
          onClick={(e) => e.preventDefault()}
        >
          {row.original.metadata.name}
        </a>
      ),
    },
    {
      id: 'status',
      header: '상태',
      accessorFn: (row: KubernetesNamespace) => {
        const status = row.status.phase;
        return status === 'Active' ? 'Active' : status;
      },
      size: 120,
      cell: ({ row }: { row: { original: KubernetesNamespace } }) => {
        const status = row.original.status.phase;
        const isActive = status === 'Active';
        return (
          <span className={`table-td-state table-td-state-${isActive ? 'run' : 'negative'}`}>
            {isActive ? 'Active' : status}
          </span>
        );
      },
    },
    {
      id: 'workspace',
      header: '작업공간',
      accessorFn: (row: KubernetesNamespace) => {
        // 라벨에서 작업공간 정보 추출 또는 기본값
        const labels = row.metadata.labels || {};
        return labels['workspace'] || 'False';
      },
      size: 150,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesNamespace) => row.metadata.creationTimestamp,
      size: 200,
    },
  ];

  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="namespace"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={namespaces}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '네임스페이스 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>네임스페이스가 없습니다.</div>
                <div>클러스터에 네임스페이스가 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={namespaces.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
