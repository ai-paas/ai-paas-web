import { CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { CreateCustomModelButton } from '../../../components/features/model/create-custom-model-button';
import { Link } from 'react-router';
import { DeleteCustomModelButton } from '../../../components/features/model/delete-custom-model-button';
import { ModelImprovementButton } from '../../../components/features/model/model-improvement-button';
import { useGetCustomModels } from '@/hooks/service/models';
import type { CustomModel } from '@/types/model';
import { formatDateTime } from '@/util/date';
import { ListPage, useListPageState } from '@/components/ui/list-page';

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: CustomModel }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: CustomModel } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: CustomModel) => row.name,
    size: 225,
    cell: ({ row }: { row: { original: CustomModel } }) => (
      <Link to={`/model/custom-model/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'repo_id',
    header: '모델 ID',
    accessorFn: (row: CustomModel) => row.repo_id,
    size: 225,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: CustomModel) => row.created_by,
    size: 200,
  },
  {
    id: 'description',
    header: '모델 소개',
    accessorFn: (row: CustomModel) => row.description,
    size: 234,
    enableSorting: false,
  },
  {
    id: 'provider_info',
    header: '모델 공급자',
    accessorFn: (row: CustomModel) => row.provider_info?.name ?? '-',
    size: 200,
  },
  {
    id: 'type_info',
    header: '모델 타입',
    accessorFn: (row: CustomModel) => row.type_info?.name ?? '-',
    size: 200,
  },
  {
    id: 'format_info',
    header: '모델 포맷',
    accessorFn: (row: CustomModel) => row.format_info?.name ?? '-',
    size: 200,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: CustomModel) => formatDateTime(row.created_at),
    size: 200,
  },
];

export default function CustomModelPage() {
  const list = useListPageState();
  const { customModels, page, isPending, isError, error } = useGetCustomModels(list.queryParams);
  const selectedId = list.getSelectedRow(customModels)?.id;

  return (
    <ListPage
      title="커스텀 모델"
      breadcrumbItems={[{ label: '모델' }, { label: '커스텀 모델' }]}
      actions={
        <>
          <CreateCustomModelButton />
          <DeleteCustomModelButton customModelId={selectedId} />
          <ModelImprovementButton
            customModelId={selectedId}
            category="optimization"
            title="하드웨어 최적화"
            selectLabel="최적화 방식"
            wrapperStyle={{ marginLeft: '20px' }}
          />
          <ModelImprovementButton
            customModelId={selectedId}
            category="lightweight"
            title="모델 경량화"
            selectLabel="경량화 방식"
          />
        </>
      }
      listState={list}
      columns={columns}
      data={customModels}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="커스텀 모델 목록을 불러오는 데 실패했습니다."
      emptyTitle="커스텀 모델이 없습니다."
      emptyDescription="생성 버튼을 클릭해 커스텀 모델을 생성해 보세요."
    />
  );
}
