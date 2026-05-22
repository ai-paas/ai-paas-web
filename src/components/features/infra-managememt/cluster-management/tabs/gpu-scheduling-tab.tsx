import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetGpuSchedulings } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { GpuScheduling } from '@/types/cluster';

interface GpuSchedulingTabProps {
  clusterName?: string | null;
}

export const GpuSchedulingTab = ({ clusterName }: GpuSchedulingTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 GPU 스케줄링 데이터 가져오기
  const { gpuSchedulings, isPending, isError } = useGetGpuSchedulings(clusterName || undefined);

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
      accessorFn: (row: GpuScheduling) => row.metadata.name,
      size: 200,
      cell: ({ row }: { row: { original: GpuScheduling } }) => (
        <span style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}>
          {row.original.metadata.name}
        </span>
      ),
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: GpuScheduling) => row.metadata.namespace,
      size: 150,
    },
    {
      id: 'pods',
      header: '파드',
      accessorFn: (row: GpuScheduling) => {
        const readyReplicas = row.status.readyReplicas || 0;
        const replicas = row.spec.replicas || 0;
        return `${readyReplicas}/${replicas}`;
      },
      size: 120,
    },
    {
      id: 'type',
      header: '유형',
      accessorFn: (row: GpuScheduling) => row.spec.type || 'Unknown',
      size: 150,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: GpuScheduling) => row.metadata.creationTimestamp,
      size: 200,
    },
  ];

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="gpu-scheduling"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={gpuSchedulings}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              'GPU 스케줄링 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>GPU 스케줄링이 없습니다.</div>
                <div>클러스터에 GPU 스케줄링이 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={gpuSchedulings.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
