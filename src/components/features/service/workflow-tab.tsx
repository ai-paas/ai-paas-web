import {
  CellCheckbox,
  HeaderCheckbox,
  Table,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { CreateWorkflowButton } from '../workflow/create-workflow-button';
import { DeleteWorkflowButton } from '../workflow/delete-workflow-button';
import { EditWorkflowButton } from '../workflow/edit-workflow-button';
import { Link } from 'react-router';
import { useGetWorkflows } from '@/hooks/service/workflows';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }) => <HeaderCheckbox table={table} />,
    cell: ({ row }) => <CellCheckbox row={row} />,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 325,
    cell: ({ row }) => (
      <Link to={`/workflow/${row.original.name}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: '워크플로우ID',
    accessorFn: (row) => row.id,
    size: 325,
  },
  {
    id: 'state',
    header: '상태',
    accessorFn: (row) => row.state,
    size: 325,
    cell: ({ row }) => (
      <span className="table-td-state table-td-state-run">{row.original.state}</span>
    ),
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.desc,
    size: 434,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 325,
  },
];

export const WorkflowTab = () => {
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { workflows, page, isPending, isError } = useGetWorkflows({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  });

  return (
    <div className="tabs-Content">
      <div className="page-toolBox">
        <div className="page-toolBox-btns">
          <CreateWorkflowButton />
          <EditWorkflowButton />
          <DeleteWorkflowButton />
        </div>
      </div>
      <div>
        <Table
          columns={columns}
          data={workflows}
          isLoading={isPending}
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
  );
};
