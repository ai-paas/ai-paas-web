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
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { CreateDatasetButton } from '../../components/features/dataset/create-dataset-button';
import { EditDatasetButton } from '../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../components/features/dataset/delete-dataset-button';
import { useGetDatasets } from '@/hooks/service/datasets';
import { formatDateTime } from '@/util/date';
import type { Dataset } from '@/types/dataset';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Dataset }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Dataset }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Dataset) => row.name,
    size: 400,
    cell: ({ row }: { row: { original: Dataset } }) => (
      <Link to={`/dataset/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Dataset) => row.created_by,
    size: 400,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Dataset) => row.description,
    size: 400,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Dataset) => formatDateTime(row.created_at),
    size: 400,
  },
];

export default function DatasetPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { datasets, page, isPending, isError } = useGetDatasets({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return null;

    return datasets[parseInt(selectedRowKeys[0])]?.id;
  }, [rowSelection, datasets]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb items={[{ label: '데이터 셋' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateDatasetButton />
            <EditDatasetButton />
            <DeleteDatasetButton />
          </div>
          <div>
            <div>
              <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
            </div>
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            data={datasets}
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
                '데이터셋 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>데이터셋이 없습니다.</div>
                  <div>생성 버튼을 클릭해 데이터셋을 생성해 보세요.</div>
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
