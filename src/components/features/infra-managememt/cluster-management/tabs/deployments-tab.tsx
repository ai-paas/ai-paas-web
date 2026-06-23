import {
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
} from '@innogrid/ui';
import { useGetKubernetesDeployments } from '@/hooks/service/clusters';
import { ResourceActionButtons } from '../resource-action-buttons';
import type { KubernetesDeployment } from '@/types/cluster';

interface DeploymentsTabProps {
  clusterName?: string | null;
}

export const DeploymentsTab = ({ clusterName }: DeploymentsTabProps) => {
  const { rowSelection, setRowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();

  // 실제 API에서 디플로이먼트 데이터 가져오기
  const { deployments, isPending, isError } = useGetKubernetesDeployments(clusterName || undefined);

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
      accessorFn: (row: KubernetesDeployment) => row.metadata.name,
      size: 200,
    },
    {
      id: 'namespace',
      header: '네임스페이스',
      accessorFn: (row: KubernetesDeployment) =>
        row.metadata.namespace,
      size: 200,
    },
    {
      id: 'pods',
      header: '파드',
      accessorFn: (row: KubernetesDeployment) => {
        const readyReplicas = row.status.readyReplicas || 0;
        const replicas = row.spec.replicas || 0;
        return `${readyReplicas}/${replicas}`;
      },
      size: 120,
    },
    {
      id: 'createdAt',
      header: '생성 일시',
      accessorFn: (row: KubernetesDeployment) => row.metadata.creationTimestamp,
      size: 200,
    },
  ];

  return (
    <div>
      {/* 버튼 영역 */}
      <ResourceActionButtons
        resourceType="deployment"
        clusterName={clusterName}
        onSuccess={handleDeleteSuccess}
        rowSelection={rowSelection}
      />

      {/* 테이블 */}
      <div className="h-[481px]">
        <Table
          columns={columns}
          data={deployments}
          isLoading={isPending}
          emptyMessage={
            isError ? (
              '디플로이먼트 정보를 불러오는 데 실패했습니다.'
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div>디플로이먼트가 없습니다.</div>
                <div>클러스터에 디플로이먼트가 생성되지 않았습니다.</div>
              </div>
            )
          }
          totalCount={deployments.length}
          pagination={pagination}
          setPagination={setPagination}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>
    </div>
  );
};
