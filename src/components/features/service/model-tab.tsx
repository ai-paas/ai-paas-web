import { Table, useTablePagination, type Sorting } from '@innogrid/ui';
import { useState } from 'react';
import { formatDateTime } from '@/util/date';
import type { ModelSummary } from '@/types/service';

interface ModelTabProps {
  models?: ModelSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: ModelSummary) => row.name,
    size: 300,
  },
  {
    id: 'modelId',
    header: '모델 ID',
    accessorFn: (row: ModelSummary) => row.id,
    size: 300,
  },
  {
    id: 'workflow',
    header: '워크플로우',
    accessorFn: (row: ModelSummary) => row.workflow_refs.map((ref) => ref.name).join(', '),
    size: 225,
  },
  {
    id: 'type',
    header: '유형',
    accessorFn: (row: ModelSummary) => row.model_type,
    size: 190,
  },
  {
    id: 'owner',
    header: '소유자',
    accessorFn: (row: ModelSummary) => row.provider,
    size: 190,
  },
  {
    id: 'desc',
    header: '모델 설명',
    accessorFn: (row: ModelSummary) => row.description ?? '',
    size: 334,
    enableSorting: false,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: ModelSummary) => formatDateTime(row.created_at),
    size: 325,
  },
];

export const ModelTab = ({ models = [], isLoading, isError }: ModelTabProps) => {
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  return (
    <div className="tabs-Content h-65.5">
      <Table
        useClientPagination
        columns={columns}
        data={models}
        isLoading={isLoading}
        emptyMessage={isError ? '모델을 불러오지 못했습니다.' : '연결된 모델이 없습니다.'}
        totalCount={models.length}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
};
