import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesSecrets } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesSecret } from '@/types/cluster';

interface SecretsTabProps {
  clusterName?: string | null;
}

export const SecretsTab = ({ clusterName }: SecretsTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 시크릿 데이터 가져오기
  const { secrets, isPending, isError } = useGetKubernetesSecrets(clusterName || undefined);

  // 삭제 성공 시 선택 해제
  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

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
      accessorFn: (row: KubernetesSecret) => row.metadata.name,
      size: 200,
      cell: ({ row }: { row: { original: KubernetesSecret } }) => (
        <span style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.original.metadata.name}
        </span>
      ),
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesSecret) => row.metadata.namespace,
      size: 150,
    },
    {
      id: 'type',
      header: '유형',
      accessorFn: (row: KubernetesSecret) => row.type || 'Unknown',
      size: 200,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesSecret) => row.metadata.creationTimestamp,
      size: 200,
    },
  ];

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="secret"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={secrets}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '시크릿 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>시크릿이 없습니다.</div>
                <div>클러스터에 시크릿이 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={secrets.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
