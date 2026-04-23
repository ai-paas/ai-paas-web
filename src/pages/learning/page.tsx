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
import { Link, useNavigate } from 'react-router';
import { EditLearningButton } from '../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../components/features/learning/delete-learning-button';
import { ModelRegisterButton } from '@/components/features/learning/model-register-button';
import { useGetLearnings } from '@/hooks/service/learning';
import { formatDateTime, formatElapsed } from '@/util/date';
import type { Learning } from '@/types/learning';

function getLearningStatusDisplay(status?: string): { label: string; className: string } {
  if (!status) return { label: '-', className: 'table-td-state-temp' };
  if (/fail|error/i.test(status)) return { label: '실패', className: 'table-td-state-negative' };
  if (/complete|success|finish|done/i.test(status))
    return { label: '완료', className: 'table-td-state-run' };
  return { label: '학습중', className: 'table-td-state-ing' };
}

function getRegistrationStatusDisplay(status?: string): { label: string; className: string } {
  switch (status) {
    case 'PIPELINE_SUBMITTED':
      return { label: '등록 요청됨', className: 'table-td-state-ing' };
    case 'FAILED':
      return { label: '실패', className: 'table-td-state-negative' };
    case 'NOT_REQUESTED':
      return { label: '미요청', className: 'table-td-state-temp' };
    default:
      return { label: status ?? '-', className: 'table-td-state-temp' };
  }
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
  },
  {
    id: 'registration_status',
    header: '모델 등록',
    accessorFn: (row: Learning) => row.registration_status,
    size: 170,
    cell: ({ row }: { row: { original: Learning } }) => {
      const { label, className } = getRegistrationStatusDisplay(row.original.registration_status);
      return <span className={`table-td-state ${className}`}>{label}</span>;
    },
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (row: Learning) => row.status,
    size: 170,
    cell: ({ row }: { row: { original: Learning } }) => {
      const { label, className } = getLearningStatusDisplay(row.original.status);
      return <span className={`table-td-state ${className}`}>{label}</span>;
    },
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
    accessorFn: (row: Learning) => formatElapsed(row.elapsed_time),
    size: 200,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Learning) => formatDateTime(row.created_at),
    size: 225,
  },
];

export default function LearningPage() {
  const navigate = useNavigate();
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { learnings, page, isPending, isError } = useGetLearnings({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
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
            <EditLearningButton experimentId={selectedExperimentId} />
            <DeleteLearningButton experimentId={selectedExperimentId} />
            <ModelRegisterButton experimentId={selectedExperimentId} />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={learnings}
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
                '학습 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>학습이 없습니다.</div>
                  <div>생성 버튼을 클릭해 학습을 생성해 보세요.</div>
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
