import {
  BreadCrumb,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { Link } from 'react-router';
import { CreatePromptButton } from '../../components/features/prompt/create-prompt-button';
import { EditPromptButton } from '../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../components/features/prompt/delete-prompt-button';
import { useGetPrompts } from '@/hooks/service/prompts';
import { formatDateTime } from '@/util/date';
import type { Prompt } from '@/types/prompt';
import { useEffect, useMemo } from 'react';

export default function PromptPage() {
  const { prompts, page, isPending, isError } = useGetPrompts();
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination, initializePagination } = useTablePagination();

  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return;

    return prompts[parseInt(selectedRowKeys[0])]?.surro_prompt_id;
  }, [rowSelection, prompts]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb items={[{ label: '프롬프트' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">프롬프트</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreatePromptButton />
            <EditPromptButton />
            <DeletePromptButton promptId={selectedId} />
          </div>
          <div>
            <div>
              <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
            </div>
          </div>
        </div>
        <div>
          <Table
            columns={columns}
            data={prompts}
            isLoading={isPending}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
                <div>검색 필터 또는 검색 조건을 변경해 보세요.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                '프롬프트 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>프롬프트가 없습니다.</div>
                  <div>생성 버튼을 클릭해 프롬프트를 생성해 보세요.</div>
                </div>
              )
            }
            totalCount={page.total}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
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
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row: Prompt) => row.created_by,
    size: 230,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Prompt) => row.description,
    size: 362,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: Prompt) => formatDateTime(row.created_at.toString()),
    size: 362,
  },
];
