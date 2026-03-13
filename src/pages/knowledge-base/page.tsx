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
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { CreateKnowledgeBaseButton } from '../../components/features/knowledge-base/create-knowledge-base-button';
import { EditKnowledgeBaseButton } from '../../components/features/knowledge-base/edit-knowledge-base-button';
import { DeleteKnowledgeBaseButton } from '../../components/features/knowledge-base/delete-knowledge-base-button';
import { useGetKnowledgeBases } from '@/hooks/service/knowledgebase';
import { formatDateTime } from '@/util/date';

export default function KnowledgeBasePage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { knowledgeBases, page, isPending, isError } = useGetKnowledgeBases({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    if (selectedRowKeys.length !== 1) return;

    return knowledgeBases[parseInt(selectedRowKeys[0])]?.surro_knowledge_id;
  }, [rowSelection, knowledgeBases]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  return (
    <main>
      <BreadCrumb items={[{ label: '지식 베이스' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">지식 베이스</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateKnowledgeBaseButton />
            <EditKnowledgeBaseButton knowledgeBaseId={selectedId} />
            <DeleteKnowledgeBaseButton knowledgeBaseId={selectedId} />
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
            data={knowledgeBases}
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
                '지식 베이스 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>지식 베이스가 없습니다.</div>
                  <div>생성 버튼을 클릭해 지식 베이스를 생성해 보세요.</div>
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
    header: ({ table }) => <HeaderCheckbox table={table} />,
    cell: ({ row }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 225,
    cell: ({ row }) => (
      <Link to={`/knowledge-base/${row.original.surro_knowledge_id}`} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: '유형',
    accessorFn: (row) => row.tag,
    size: 225,
  },
  {
    id: 'created_by',
    header: '생성자',
    accessorFn: (row) => row.created_by,
    size: 225,
  },
  {
    id: 'service',
    header: '용량',
    accessorFn: (row) => row.service,
    size: 271,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'status',
    header: '데이터수',
    accessorFn: (row) => row.status,
    size: 271,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row) => row.description,
    size: 271,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row) => formatDateTime(row.created_at),
    size: 225,
  },
];
