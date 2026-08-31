import { Table, useTablePagination, type Sorting } from '@innogrid/ui';
import { useState } from 'react';
import { Link } from 'react-router';
import { formatDateTime } from '@/util/date';
import type { KnowledgeBaseSummary } from '@/types/service';

interface KnowledgeBaseTabProps {
  knowledgeBases?: KnowledgeBaseSummary[];
  isLoading?: boolean;
  isError?: boolean;
}

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: KnowledgeBaseSummary) => row.name,
    size: 300,
    cell: ({ row }: { row: { original: KnowledgeBaseSummary } }) => (
      <Link to={`/knowledge-base/${row.original.id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'workflow',
    header: '워크플로우',
    accessorFn: (row: KnowledgeBaseSummary) => row.workflow_refs.map((ref) => ref.name).join(', '),
    size: 300,
  },
  {
    id: 'type',
    header: '유형',
    accessorFn: (row: KnowledgeBaseSummary) => row.type,
    size: 285,
  },
  {
    id: 'owner',
    header: '소유자',
    accessorFn: (row: KnowledgeBaseSummary) => row.created_by,
    size: 325,
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row: KnowledgeBaseSummary) => row.description ?? '',
    size: 334,
    enableSorting: false,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: KnowledgeBaseSummary) => formatDateTime(row.created_at),
    size: 325,
  },
];

export const KnowledgeBaseTab = ({
  knowledgeBases = [],
  isLoading,
  isError,
}: KnowledgeBaseTabProps) => {
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  return (
    <div className="tabs-Content h-65.5">
      <Table
        useClientPagination
        columns={columns}
        data={knowledgeBases}
        isLoading={isLoading}
        emptyMessage={
          isError ? '지식 베이스를 불러오지 못했습니다.' : '연결된 지식 베이스가 없습니다.'
        }
        totalCount={knowledgeBases.length}
        pagination={pagination}
        setPagination={setPagination}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
};
