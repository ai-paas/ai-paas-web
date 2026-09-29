import { CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { CreateWorkflowButton } from '../../../components/features/workflow/create-workflow-button';
import { EditWorkflowButton } from '../../../components/features/workflow/edit-workflow-button';
import { ExecuteWorkflowButton } from '../../../components/features/workflow/execute-workflow-button';
import { DeleteWorkflowButton } from '../../../components/features/workflow/delete-workflow-button';
import { StopWorkflowDeploymentButton } from '../../../components/features/workflow/stop-workflow-deployment-button';
import { Link } from 'react-router';
import { useGetWorkflows } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import { getWorkflowStatus } from '@/util/workflow';
import type { Workflow } from '@/types/workflow';
import { ListPage, useListPageState } from '@/components/ui/list-page';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Workflow }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: Workflow } }) => <CellCheckbox row={row} />,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Workflow) => row.name,
    size: 220,
    cell: ({ row }: { row: { original: Workflow } }) => (
      <Link to={`/workflow/workflow/${row.original.surro_workflow_id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: '워크플로우 ID',
    accessorFn: (row: Workflow) => row.surro_workflow_id,
    size: 280,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Workflow) => row.created_by,
    size: 150,
  },
  {
    id: 'service',
    header: '서비스',
    accessorFn: (row: Workflow) => row.service_id,
    size: 250,
    enableSorting: false,
  },
  {
    id: 'category',
    header: '카테고리',
    accessorFn: (row: Workflow) => row.category,
    size: 150,
    enableSorting: false,
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (row: Workflow) => row.status,
    size: 100,
    cell: ({ row }: { row: { original: Workflow } }) => {
      const state = getWorkflowStatus(row.original.status);

      return <span className={`table-td-state ${state.className}`}>{state.label}</span>;
    },
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row: Workflow) => row.description,
    size: 300,
    enableSorting: false,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Workflow) => formatDateTime(row.created_at),
    size: 225,
  },
];

export default function WorkflowPage() {
  const list = useListPageState({ initialSorting: [] });
  const { workflows, page, isPending, isError, error } = useGetWorkflows(list.queryParams);
  const selectedId = list.getSelectedRow(workflows)?.surro_workflow_id;

  return (
    <ListPage
      title="워크플로우"
      breadcrumbItems={[{ label: '워크플로우' }]}
      actions={
        <>
          <CreateWorkflowButton />
          <EditWorkflowButton workflowId={selectedId} />
          <DeleteWorkflowButton workflowId={selectedId} />
          <ExecuteWorkflowButton workflowId={selectedId} />
          <StopWorkflowDeploymentButton workflowId={selectedId} />
        </>
      }
      listState={list}
      columns={columns}
      data={workflows}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="워크플로우 목록을 불러오는 데 실패했습니다."
      emptyTitle="워크플로우가 없습니다."
      emptyDescription="생성 버튼을 클릭해 워크플로우를 생성해 보세요."
    />
  );
}
