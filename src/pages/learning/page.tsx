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
  type Sorting,
} from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EditLearningButton } from '../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../components/features/learning/delete-learning-button';
import { ModelRegisterButton } from '@/components/features/learning/model-register-button';
import { useGetLearnings } from '@/hooks/service/learning';
import { formatDateTime } from '@/util/date';
import type { Learning } from '@/types/learning';

export default function LearningPage() {
  const navigate = useNavigate();
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);
  const { learnings, page, isPending, isError } = useGetLearnings({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  });

  const selectedExperimentId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return;

    return learnings[parseInt(selectedRowKeys[0])]?.id;
  }, [rowSelection, learnings]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '학습' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">학습</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button size="medium" color="primary" onClick={() => navigate('/learning/create')}>
              생성
            </Button>
            <EditLearningButton />
            <DeleteLearningButton />
            <ModelRegisterButton experimentId={selectedExperimentId} />
          </div>
          <div>
            <div>
              <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
            </div>
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            useMultiSelect
            columns={columns}
            data={learnings}
            totalCount={page.total}
            isLoading={isPending}
            globalFilter={searchValue}
            emptyMessage={isError ? '학습 목록을 불러오는 데 실패했습니다.' : '학습이 없습니다.'}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            setSorting={setSorting}
            sorting={sorting}
          />
        </div>
      </div>
    </main>
  );
}

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Learning }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Learning }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Learning) => row.name,
    size: 225,
    cell: ({ row }: { row: { original: Learning } }) => (
      <Link to={`/learning/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: 'ID',
    accessorFn: (row: Learning) => row.id,
    size: 170,
  },
  {
    id: 'reference_model',
    header: '참조 모델',
    accessorFn: (row: Learning) => row.reference_model?.name,
    size: 200,
    enableSorting: false,
  },
  {
    id: 'registration_status',
    header: '모델 등록',
    accessorFn: (row: Learning) => row.registration_status,
    size: 170,
    cell: ({ row }: { row: { original: Learning } }) => (
      <span className="table-td-state table-td-state-run">{row.original.registration_status}</span>
    ),
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (row: Learning) => row.status,
    size: 170,
    cell: ({ row }: { row: { original: Learning } }) => (
      <span className="table-td-state table-td-state-run">{row.original.status}</span>
    ),
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Learning) => row.description,
    size: 225,
  },
  {
    id: 'elapsed_time',
    header: '경과 시간',
    accessorFn: (row: Learning) => row.elapsed_time,
    size: 200,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Learning) => formatDateTime(row.created_at),
    size: 225,
  },
];
