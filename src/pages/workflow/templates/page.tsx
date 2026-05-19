import {
  BreadCrumb,
  Button,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { DeleteWorkflowTemplateButton } from '@/components/features/workflow/delete-workflow-template-button';
import { useGetTemplates } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import type { WorkflowTemplateBrief } from '@/types/workflow';

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
];

export default function WorkflowTemplatePage() {
  const navigate = useNavigate();
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { workflowTemplates, page, isPending, isError } = useGetTemplates({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  });

  const selectedTemplate = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);
    if (selectedRowKeys.length !== 1) return;

    return workflowTemplates[parseInt(selectedRowKeys[0])];
  }, [rowSelection, workflowTemplates]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '워크플로우' }, { label: '워크플로우 템플릿' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">워크플로우 템플릿</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
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
              onDeleted={() => setRowSelection({})}
            />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            data={workflowTemplates}
            isLoading={isPending}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
                <div>검색 필터 또는 검색 조건을 변경해 보세요.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                '템플릿 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>워크플로우 템플릿이 없습니다.</div>
                  <div>생성 버튼을 클릭해 워크플로우 템플릿을 생성해 보세요.</div>
                </div>
              )
            }
            totalCount={page.total}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}
