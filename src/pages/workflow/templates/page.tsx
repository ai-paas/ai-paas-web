import { Button, CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { Link, useNavigate } from 'react-router';
import { DeleteWorkflowTemplateButton } from '@/components/features/workflow/delete-workflow-template-button';
import { useGetTemplates } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import type { WorkflowTemplateBrief } from '@/types/workflow';
import { ListPage, useListPageState } from '@/components/ui/list-page';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: WorkflowTemplateBrief }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: WorkflowTemplateBrief } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: WorkflowTemplateBrief) => row.name,
    size: 240,
    cell: ({ row }: { row: { original: WorkflowTemplateBrief } }) => (
      <Link to={`/workflow/templates/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'category',
    header: '카테고리',
    accessorFn: (row: WorkflowTemplateBrief) => row.category,
    size: 160,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: WorkflowTemplateBrief) => row.description,
    size: 320,
    enableSorting: false,
  },
  {
    id: 'usage_count',
    header: '사용 수',
    accessorFn: (row: WorkflowTemplateBrief) => row.usage_count,
    size: 120,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: WorkflowTemplateBrief) => row.creator?.name ?? row.created_by ?? '-',
    size: 160,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: WorkflowTemplateBrief) => formatDateTime(row.created_at),
    size: 225,
  },
].map((column) => ({ ...column, enableSorting: false }));

export default function WorkflowTemplatePage() {
  const navigate = useNavigate();
  const list = useListPageState();
  const { workflowTemplates, page, isPending, isError, error } = useGetTemplates({
    page: list.queryParams.page,
    size: list.queryParams.size,
  });
  const selectedTemplate = list.getSelectedRow(workflowTemplates);

  return (
    <ListPage
      title="워크플로우 템플릿"
      breadcrumbItems={[{ label: '워크플로우' }, { label: '워크플로우 템플릿' }]}
      actions={
        <>
          <Button
            size="medium"
            color="primary"
            onClick={() => navigate('/workflow/templates/create')}
          >
            생성
          </Button>
          <Button
            size="medium"
            color="secondary"
            disabled={!selectedTemplate}
            onClick={() => {
              if (!selectedTemplate) return;
              navigate(`/workflow/templates/${selectedTemplate.id}/edit`);
            }}
          >
            수정
          </Button>
          <DeleteWorkflowTemplateButton
            templateId={selectedTemplate?.id}
            templateName={selectedTemplate?.name}
            onDeleted={() => list.setRowSelection({})}
          />
        </>
      }
      listState={list}
      columns={columns}
      data={workflowTemplates}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="템플릿 목록을 불러오는 데 실패했습니다."
      emptyTitle="워크플로우 템플릿이 없습니다."
      emptyDescription="생성 버튼을 클릭해 워크플로우 템플릿을 생성해 보세요."
    />
  );
}
