import { Button, CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { Link, useNavigate } from 'react-router';
import { EditDatasetButton } from '../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../components/features/dataset/delete-dataset-button';
import { useGetDatasets } from '@/hooks/service/datasets';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { formatDateTime } from '@/util/date';
import type { Dataset } from '@/types/dataset';

const DATASET_KIND_LABELS: Record<string, string> = {
  'object-detection': '객체 감지',
  'protein-classification': '단백질 분류',
};

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
    id: 'kind',
    header: '분류',
    accessorFn: (row: Dataset) => (row.kind ? (DATASET_KIND_LABELS[row.kind] ?? row.kind) : 'N/A'),
    size: 200,
    enableSorting: false,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Dataset) => row.created_by,
    size: 400,
    enableSorting: false,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Dataset) => row.description,
    size: 400,
    enableSorting: false,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Dataset) => formatDateTime(row.created_at),
    size: 400,
  },
];

export default function DatasetPage() {
  const navigate = useNavigate();
  const list = useListPageState({ initialSorting: [] });
  const { datasets, page, isPending, isError, error } = useGetDatasets(list.queryParams);
  const selectedId = list.getSelectedRow(datasets)?.id;

  return (
    <ListPage
      title="데이터 셋"
      breadcrumbItems={[{ label: '데이터 셋' }]}
      actions={
        <>
          <Button size="medium" color="primary" onClick={() => navigate('/dataset/create')}>
            생성
          </Button>
          <EditDatasetButton datasetId={selectedId} />
          <DeleteDatasetButton datasetId={selectedId} />
        </>
      }
      listState={list}
      columns={columns}
      data={datasets}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="데이터셋 목록을 불러오는 데 실패했습니다."
      emptyTitle="데이터셋이 없습니다."
      emptyDescription="생성 버튼을 클릭해 데이터셋을 생성해 보세요."
      pageSizeOptions={[10, 15, 20, 30, 50, 100]}
    />
  );
}
