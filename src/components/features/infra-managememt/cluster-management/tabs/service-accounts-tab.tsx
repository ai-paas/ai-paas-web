import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesServiceAccounts } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesServiceAccount } from '@/types/cluster';

interface ServiceAccountsTabProps {
  clusterName?: string | null;
}

export const ServiceAccountsTab = ({ clusterName }: ServiceAccountsTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 서비스 어카운트 데이터 가져오기
  const { serviceAccounts, isPending, isError } = useGetKubernetesServiceAccounts(
    clusterName || undefined
  );

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
      accessorFn: (row: KubernetesServiceAccount) => row.metadata.name,
      size: 200,
      cell: ({ row }: { row: { original: KubernetesServiceAccount } }) => (
        <span style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.original.metadata.name}
        </span>
      ),
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesServiceAccount) =>
        row.metadata.namespace,
      size: 150,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesServiceAccount) => row.metadata.creationTimestamp,
      size: 200,
    },
  ];

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="service-account"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={serviceAccounts}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '서비스 어카운트 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>서비스 어카운트가 없습니다.</div>
                <div>클러스터에 서비스 어카운트가 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={serviceAccounts.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
