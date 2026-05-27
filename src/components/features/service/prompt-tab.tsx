import { Table, useTablePagination, type Sorting } from '@innogrid/ui';
import { useState } from 'react';
import { Link } from 'react-router';
import { formatDateTime } from '@/util/date';
import type { PromptSummary } from '@/types/service';

interface PromptTabProps {
  prompts?: PromptSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: PromptSummary) => row.name,
    size: 334,
    cell: ({ row }: { row: { original: PromptSummary } }) => (
      <Link to={`/prompt/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'creator',
    header: '생성자',
    accessorFn: (row: PromptSummary) => row.created_by,
    size: 334,
  },
  {
    id: 'variable',
    header: '변수',
    accessorFn: (row: PromptSummary) => `${row.variables.length}개`,
    size: 334,
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row: PromptSummary) => row.description ?? '',
    size: 334,
    enableSorting: false,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: PromptSummary) => formatDateTime(row.created_at),
    size: 325,
  },
];

export const PromptTab = ({ prompts = [], isLoading, isError }: PromptTabProps) => {
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  return (
    <div className="tabs-Content h-65.5">
      <Table
        useClientPagination
        columns={columns}
        data={prompts}
        isLoading={isLoading}
        emptyMessage={isError ? '프롬프트를 불러오지 못했습니다.' : '연결된 프롬프트가 없습니다.'}
        totalCount={prompts.length}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
};
