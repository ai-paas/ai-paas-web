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

interface WorkflowRow {
  name: string;
  id: string | number;
  state: string;
  desc: string;
  date: string;
  [key: string]: unknown;
}

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: WorkflowRow }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: WorkflowRow } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: WorkflowRow) => row.name,
    size: 325,
    cell: ({ row }: { row: { original: WorkflowRow } }) => (
      <Link to={`/workflow/${row.original.name}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: '워크플로우ID',
    accessorFn: (row: WorkflowRow) => row.id,
    size: 325,
  },
  {
    id: 'state',
    header: '상태',
    accessorFn: (row: WorkflowRow) => row.state,
    size: 325,
    cell: ({ row }: { row: { original: WorkflowRow } }) => (
      <span className="table-td-state table-td-state-run">{row.original.state}</span>
    ),
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row: WorkflowRow) => row.desc,
    size: 434,
    enableSorting: false,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: WorkflowRow) => row.date,
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
