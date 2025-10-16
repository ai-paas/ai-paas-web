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
import { CreateCustomModelButton } from '../../../components/features/model/create-custom-model-button';
import { Link } from 'react-router';
import { EditCustomModelButton } from '../../../components/features/model/edit-custom-model-button';
import { DeleteCustomModelButton } from '../../../components/features/model/delete-custom-model-button';
import { HardwareOptimizationButton } from '../../../components/features/model/hardware-optimization-button';
import { ModelCompressionButton } from '../../../components/features/model/model-compression-button';
import { useGetCustomModels } from '@/hooks/service/models';
import { useEffect, useMemo } from 'react';
import type { Model } from '@/types/model';
import { formatDateTime } from '@/util/date';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Model }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: Model } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Model) => row.name,
    size: 225,
    cell: ({ row }: { row: { original: Model } }) => (
      <Link to={'/model/custom-model/test'} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: '모델 ID',
    accessorFn: (row: Model) => row.parent_model_id,
    size: 225,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Model) => row.created_by,
    size: 200,
  },
  {
    id: 'description',
    header: '모델 소개',
    accessorFn: (row: Model) => row.description,
    size: 234,
    enableSorting: false,
  },
  {
    id: 'provider_info',
    header: '모델 공급자',
    accessorFn: (row: Model) => row.provider_info.name,
    size: 200,
  },
  {
    id: 'type_info',
    header: '모델 타입',
    accessorFn: (row: Model) => row.type_info.name,
    size: 200,
  },
  {
    id: 'format_info',
    header: '모델 포맷',
    accessorFn: (row: Model) => row.format_info.name,
    size: 200,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Model) => formatDateTime(row.created_at.toString()),
    size: 200,
  },
];

export default function CustomModelPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { customModels, page, isPending, isError } = useGetCustomModels({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return null;

    return customModels[parseInt(selectedRowKeys[0])]?.id;
  }, [rowSelection, customModels]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb items={[{ label: '모델' }, { label: '커스텀 모델' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">커스텀 모델</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateCustomModelButton />
            <EditCustomModelButton customModelId={selectedId} />
            <DeleteCustomModelButton customModelId={selectedId} />
            <HardwareOptimizationButton customModelId={selectedId} />
            <ModelCompressionButton customModelId={selectedId} />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            data={customModels}
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
