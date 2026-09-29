import { CellCheckbox, HeaderCheckbox, type ColDef, type TableRow } from '@innogrid/ui';
import type { KnowledgeBaseBrief } from '@/types/knowledgebase';
import { Link } from 'react-router';
import { CreateKnowledgeBaseButton } from '../../components/features/knowledge-base/create-knowledge-base-button';
import { EditKnowledgeBaseButton } from '../../components/features/knowledge-base/edit-knowledge-base-button';
import { DeleteKnowledgeBaseButton } from '../../components/features/knowledge-base/delete-knowledge-base-button';
import { useGetKnowledgeBases } from '@/hooks/service/knowledgebase';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { formatDateTime } from '@/util/date';

export default function KnowledgeBasePage() {
  const list = useListPageState({ initialSorting: [] });
  const { knowledgeBases, page, isPending, isError, error } = useGetKnowledgeBases(list.queryParams);
  const selectedId = list.getSelectedRow(knowledgeBases)?.surro_knowledge_id;

  return (
    <ListPage
      title="지식 베이스"
      breadcrumbItems={[{ label: '지식 베이스' }]}
      actions={
        <>
          <CreateKnowledgeBaseButton />
          <EditKnowledgeBaseButton knowledgeBaseId={selectedId} />
          <DeleteKnowledgeBaseButton knowledgeBaseId={selectedId} />
        </>
      }
      listState={list}
      columns={columns}
      data={knowledgeBases}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="지식 베이스 목록을 불러오는 데 실패했습니다."
      emptyTitle="지식 베이스가 없습니다."
      emptyDescription="생성 버튼을 클릭해 지식 베이스를 생성해 보세요."
    />
  );
}

const columns: ColDef<KnowledgeBaseBrief>[] = [
  {
    id: 'select',
    size: 30,
    header: ({
      table,
    }: {
      table: Parameters<typeof HeaderCheckbox<KnowledgeBaseBrief>>[0]['table'];
    }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: TableRow<KnowledgeBaseBrief> }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: KnowledgeBaseBrief) => row.name,
    size: 225,
    cell: ({ row }: { row: TableRow<KnowledgeBaseBrief> }) => (
      <Link to={`/knowledge-base/${row.original.surro_knowledge_id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'collection_name',
    header: '컬렉션',
    accessorFn: (row: KnowledgeBaseBrief) => row.collection_name,
    size: 200,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: KnowledgeBaseBrief) => row.created_by,
    size: 225,
    enableSorting: false,
  },
  {
    id: 'chunk_size',
    header: '청크 크기',
    accessorFn: (row: KnowledgeBaseBrief) => row.chunk_size,
    size: 271,
    enableSorting: false,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: KnowledgeBaseBrief) => row.description,
    size: 271,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: KnowledgeBaseBrief) => formatDateTime(row.created_at),
    size: 225,
  },
];
