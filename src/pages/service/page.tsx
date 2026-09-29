import { Link } from 'react-router';
import { HeaderCheckbox, CellCheckbox } from '@innogrid/ui';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { EditServiceButton } from '@/components/features/service/edit-service-button';
import { CreateServiceButton } from '@/components/features/service/create-service-button';
import { DeleteServiceButton } from '@/components/features/service/delete-service-button';
import { useGetServices } from '@/hooks/service/services';
import { formatDateTime } from '@/util/date';
import type { Service } from '@/types/service';

// 테이블 컬럼 설정
const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Service }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: Service } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Service) => row.name,
    size: 325,
    cell: ({ row }: { row: { original: Service } }) => (
      <Link to={`/service/${row.original.surro_service_id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'tags',
    header: '태그',
    accessorFn: (row: Service) => row.tags?.join(', '),
    size: 280,
    enableSorting: false,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Service) => row.created_by,
    size: 280,
    enableSorting: false,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Service) => row.description,
    size: 434,
    enableSorting: false,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Service) => formatDateTime(row.created_at),
    size: 325,
  },
];

export default function ServicePage() {
  const list = useListPageState({ initialSorting: [] });
  const { services, page, isPending, isError, error } = useGetServices(list.queryParams);
  const selectedId = list.getSelectedRow(services)?.surro_service_id;

  return (
    <ListPage
      title="서비스"
      listState={list}
      actions={
        <>
          <CreateServiceButton />
          <EditServiceButton serviceId={selectedId} />
          <DeleteServiceButton serviceId={selectedId} />
        </>
      }
      columns={columns}
      data={services}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="서비스 목록을 불러오는 데 실패했습니다."
      emptyTitle="서비스가 없습니다."
      emptyDescription="생성 버튼을 클릭해 서비스를 생성해 보세요."
    />
  );
}
