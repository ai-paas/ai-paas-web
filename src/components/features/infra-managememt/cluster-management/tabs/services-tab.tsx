import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesServices } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesService } from '@/types/cluster';

interface ServicesTabProps {
  clusterName?: string | null;
}

export const ServicesTab = ({ clusterName }: ServicesTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 서비스 데이터 가져오기
  const { services, isPending, isError } = useGetKubernetesServices(clusterName || undefined);

  // 삭제 성공 시 선택 해제
  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

  const columns = [
    {
      id: 'select',
      size: 50,
      header: ({ table }: { table: KubernetesService }) => <HeaderCheckbox table={table} />,
      cell: ({ row }: { row: KubernetesService }) => <CellCheckbox row={row} />,
      enableSorting: false,
    },
    {
      id: 'name',
      header: '이름',
      accessorFn: (row: KubernetesService) => row.metadata?.name || row.name || 'Unknown',
      size: 200,
      cell: ({ row }: { row: { original: KubernetesService } }) => (
        <span style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.original.metadata?.name || row.original.name || 'Unknown'}
        </span>
      ),
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesService) => row.metadata?.namespace || row.namespace || 'Unknown',
      size: 150,
    },
    {
      id: 'address',
      header: '주소',
      accessorFn: (row: KubernetesService) => {
        // ClusterIP를 우선으로 하고, LoadBalancer IP가 있으면 그것을 사용
        const clusterIP = row.spec?.clusterIP;
        const loadBalancerIP = row.status?.loadBalancer?.ingress?.[0]?.ip;
        return loadBalancerIP || clusterIP || '-';
      },
      size: 150,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesService) => {
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
        resourceType="service"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={services}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '서비스 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>서비스가 없습니다.</div>
                <div>클러스터에 서비스가 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={services.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
