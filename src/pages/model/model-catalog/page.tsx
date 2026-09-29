import { CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { CreateModelCatalogButton } from '../../../components/features/model/create-model-catalog-button';
import { DeleteModelCatalogButton } from '../../../components/features/model/delete-model-catalog-button';
import { Link } from 'react-router';
import { useGetModelCatalogs } from '@/hooks/service/models';
import type { ModelCatalog } from '@/types/model';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/util/date';
import { ListPage, useListPageState } from '@/components/ui/list-page';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: ModelCatalog }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: ModelCatalog }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: ModelCatalog) => row.name,
    size: 265,
    cell: ({ row }: { row: { original: ModelCatalog } }) => (
      <Link to={`/model/model-catalog/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'repo_id',
    header: '모델 ID',
    accessorFn: (row: ModelCatalog) => row.repo_id,
    size: 255,
  },
  {
    id: 'description',
    header: '모델 소개',
    accessorFn: (row: ModelCatalog) => row.description,
    size: 334,
    enableSorting: false,
  },
  {
    id: 'task',
    header: '테스크',
    accessorFn: (row: ModelCatalog) => row.task,
    size: 200,
  },
  {
    id: 'parameter',
    header: '파라미터',
    accessorFn: (row: ModelCatalog) => row.parameter,
    size: 200,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: ModelCatalog) => row.created_by,
    size: 200,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: ModelCatalog) => formatDateTime(row.created_at),
    size: 225,
  },
].map((column) => ({ ...column, enableSorting: false }));

export default function ModelCatalogPage() {
  const { isAdmin } = useAuth();
  const list = useListPageState();
  const { modelCatalogs, page, isPending, isError, error } = useGetModelCatalogs(list.queryParams);
  const selectedId = list.getSelectedRow(modelCatalogs)?.id ?? null;

  return (
    <ListPage
      title="모델 카탈로그"
      breadcrumbItems={[{ label: '모델' }, { label: '모델 카탈로그' }]}
      actions={
        isAdmin && (
          <>
            <CreateModelCatalogButton />
            <DeleteModelCatalogButton modelCatalogId={selectedId} />
          </>
        )
      }
      listState={list}
      columns={columns}
      data={modelCatalogs}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="모델 카탈로그 목록을 불러오는 데 실패했습니다."
      emptyTitle="모델 카탈로그가 없습니다."
      emptyDescription="생성 버튼을 클릭해 모델 카탈로그를 생성해 보세요."
    />
  );
}
