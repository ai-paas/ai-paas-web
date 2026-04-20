import {
  BreadCrumb,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { CreateWorkflowButton } from '../../components/features/workflow/create-workflow-button';
import { EditWorkflowButton } from '../../components/features/workflow/edit-workflow-button';
import { DeleteWorkflowButton } from '../../components/features/workflow/delete-workflow-button';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useGetWorkflows } from '@/hooks/service/workflows';
import { formatDateTime } from '@/util/date';
import type { Workflow } from '@/types/workflow';

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
      <Link to={'/workflow/detail'} className="table-td-link">
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
    id: 'creator',
    header: '생성자',
    accessorFn: (row: Workflow) => row.created_by,
    size: 150,
  },
  {
    id: 'service',
    header: '서비스',
    accessorFn: (row: Workflow) => row.service_id,
    size: 250,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'category',
    header: '카테고리',
    accessorFn: (row: Workflow) => row.category,
    size: 150,
  },
  {
    id: 'state',
    header: '상태',
    accessorFn: (row: Workflow) => row.status,
    size: 100,
    cell: ({ row }: { row: { original: Workflow } }) => (
      <span className="table-td-state table-td-state-run">{row.original.status}</span>
    ),
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row: Workflow) => row.description,
    size: 300,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: Workflow) => formatDateTime(row.created_at),
    size: 225,
  },
];

export default function WorkflowPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { workflows, page, isPending, isError } = useGetWorkflows({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '워크플로우' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">워크플로우</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateWorkflowButton />
            <EditWorkflowButton />
            <DeleteWorkflowButton />
          </div>
          <div>
            <div>
              <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
            </div>
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={workflows}
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
                '워크플로우 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>워크플로우가 없습니다.</div>
                  <div>생성 버튼을 클릭해 워크플로우를 생성해 보세요.</div>
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
