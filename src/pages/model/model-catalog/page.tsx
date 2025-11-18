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
import { CreateModelCatalogButton } from '../../../components/features/model/create-model-catalog-button';
import { EditModelCatalogButton } from '../../../components/features/model/edit-model-catalog-button';
import { DeleteModelCatalogButton } from '../../../components/features/model/delete-model-catalog-button';
import { Link } from 'react-router';
import { useGetModelCatalogs } from '@/hooks/service/models';
import type { Model } from '@/types/model';
import { useAuth } from '@/hooks/useAuth';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Model }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Model }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 325,
    cell: ({ row }) => (
      <Link to={`/model/model-catalog/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'repo_id',
    header: '모델 ID',
    accessorFn: (row) => row.repo_id,
    size: 325,
  },
  {
    id: 'desc',
    header: '모델 소개',
    accessorFn: (row) => row.desc,
    size: 434,
    enableSorting: false,
  },
  {
    id: 'task',
    header: '테스크',
    accessorFn: (row) => row.modelId,
    size: 325,
  },
  {
    id: 'parameter',
    header: '파라미터',
    accessorFn: (row) => row.modelId,
    size: 325,
  },
  {
    id: 'creator',
    header: '생성자',
    accessorFn: (row) => row.creator,
    size: 325,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 325,
  },
];

export default function ModelCatalogPage() {
  const { isAdmin } = useAuth();
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { modelCatalogs, page, isPending, isError } = useGetModelCatalogs({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return null;

    return modelCatalogs[parseInt(selectedRowKeys[0])]?.id;
  }, [rowSelection, modelCatalogs]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb
        items={[{ label: '모델' }, { label: '모델 카탈로그' }]}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">모델 카탈로그</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            {isAdmin && (
              <>
                <CreateModelCatalogButton />
                <EditModelCatalogButton modelCatalogId={selectedId} />
                <DeleteModelCatalogButton modelCatalogId={selectedId} />
              </>
            )}
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            data={modelCatalogs}
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
