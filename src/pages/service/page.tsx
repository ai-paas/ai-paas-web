import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  BreadCrumb,
  SearchInput,
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
  useSearchInputState,
} from '@innogrid/ui';
import { EditServiceButton } from '@/components/features/service/edit-service-button';
import { CreateServiceButton } from '@/components/features/service/create-service-button';
import { DeleteServiceButton } from '@/components/features/service/delete-service-button';
import { useGetServices } from '@/hooks/service/services';
import { formatDateTime } from '@/util/date';

interface ServiceRow {
  id: number;
  name: string;
  description: string;
  tag: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 테이블 컬럼 설정
const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: ServiceRow }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: ServiceRow } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: ServiceRow) => row.name,
    size: 325,
    cell: ({ row }: { row: { original: ServiceRow } }) => (
      <Link to={`/service/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'tag',
    header: '태그',
    accessorFn: (row: ServiceRow) => row.tag,
    size: 325,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: ServiceRow) => row.created_by,
    size: 325,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: ServiceRow) => row.description,
    size: 434,
    enableSorting: false,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: ServiceRow) => formatDateTime(row.created_at),
    size: 325,
  },
];

export default function ServicePage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { services, page, isPending, isError } = useGetServices({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  // 선택된 행의 ID를 추출
  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    // 단일 선택만 허용
    if (selectedRowKeys.length !== 1) return null;

    return services[parseInt(selectedRowKeys[0])]?.id;
  }, [rowSelection, services]);

  // 검색어가 변경되면 페이지네이션 초기화
  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb items={[{ label: '서비스' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">서비스</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateServiceButton />
            <EditServiceButton serviceId={selectedId} />
            <DeleteServiceButton serviceId={selectedId} />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={services}
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
                '서비스 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>서비스가 없습니다.</div>
                  <div>생성 버튼을 클릭해 서비스를 생성해 보세요.</div>
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
