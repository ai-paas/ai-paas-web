import { Button, CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { Link, useNavigate } from 'react-router';
import { EditLearningButton } from '../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../components/features/learning/delete-learning-button';
import { ModelRegisterButton } from '@/components/features/learning/model-register-button';
import { useGetLearnings } from '@/hooks/service/learning';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { formatDateTime, formatElapsed } from '@/util/date';
import type { Learning } from '@/types/learning';

function getLearningStatusDisplay(status?: string | null): { label: string; className: string } {
  if (!status) return { label: '-', className: 'table-td-state-temp' };
  if (/fail|error/i.test(status)) return { label: '실패', className: 'table-td-state-negative' };
  if (/complete|success|finish|done/i.test(status))
    return { label: '완료', className: 'table-td-state-run' };
  return { label: '학습중', className: 'table-td-state-ing' };
}

function getRegistrationStatusDisplay(status?: string | null): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'PIPELINE_SUBMITTED':
      return { label: '등록 요청됨', className: 'table-td-state-ing' };
    case 'SUCCESS':
      return { label: '등록 완료', className: 'table-td-state-run' };
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
    enableSorting: false,
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
    enableSorting: false,
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
    enableSorting: false,
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
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'elapsed_time',
    header: '경과 시간',
    accessorFn: (row: Learning) => formatElapsed(row.elapsed_time),
    size: 200,
    enableSorting: false,
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
  const list = useListPageState({ initialSorting: [] });
  const { learnings, page, isPending, isError, error } = useGetLearnings(list.queryParams);
  const selectedExperimentId = list.getSelectedRow(learnings)?.id;

  return (
    <ListPage
      title="학습"
      breadcrumbItems={[{ label: '학습' }]}
      actions={
        <>
          <Button size="medium" color="primary" onClick={() => navigate('/learning/create')}>
            생성
          </Button>
          <EditLearningButton experimentId={selectedExperimentId} />
          <DeleteLearningButton experimentId={selectedExperimentId} />
          <ModelRegisterButton experimentId={selectedExperimentId} />
        </>
      }
      listState={list}
      columns={columns}
      data={learnings}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="학습 목록을 불러오는 데 실패했습니다."
      emptyTitle="학습이 없습니다."
      emptyDescription="생성 버튼을 클릭해 학습을 생성해 보세요."
    />
  );
}
