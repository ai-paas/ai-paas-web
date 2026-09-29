import { CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { Link } from 'react-router';
import { CreatePromptButton } from '../../components/features/prompt/create-prompt-button';
import { EditPromptButton } from '../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../components/features/prompt/delete-prompt-button';
import { useGetPrompts } from '@/hooks/service/prompts';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { formatDateTime } from '@/util/date';
import type { Prompt } from '@/types/prompt';

export default function PromptPage() {
  const list = useListPageState({ initialSorting: [{ id: 'created_at', desc: true }] });
  const { prompts, page, isPending, isError, error } = useGetPrompts(list.queryParams);
  const selectedId = list.getSelectedRow(prompts)?.surro_prompt_id;

  return (
    <ListPage
      title="프롬프트"
      breadcrumbItems={[{ label: '프롬프트' }]}
      actions={
        <>
          <CreatePromptButton />
          <EditPromptButton promptId={selectedId} />
          <DeletePromptButton promptId={selectedId} />
        </>
      }
      listState={list}
      columns={columns}
      data={prompts}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="프롬프트 목록을 불러오는 데 실패했습니다."
      emptyTitle="프롬프트가 없습니다."
      emptyDescription="생성 버튼을 클릭해 프롬프트를 생성해 보세요."
    />
  );
}

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Prompt }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Prompt }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Prompt) => row.name,
    size: 352,
    cell: ({ row }: { row: { original: Prompt } }) => (
      <Link to={`/prompt/${row.original.surro_prompt_id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'prompt_variable',
    header: '변수',
    accessorFn: (row: Prompt) => `${row.prompt_variable?.length ?? 0}개`,
    size: 230,
    enableSorting: false,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Prompt) => row.created_by,
    size: 230,
    enableSorting: false,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Prompt) => row.description,
    size: 362,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Prompt) => formatDateTime(row.created_at),
    size: 362,
  },
];
