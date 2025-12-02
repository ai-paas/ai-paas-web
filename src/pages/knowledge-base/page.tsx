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
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CreateKnowledgeBaseButton } from '../../components/features/knowledge-base/create-knowledge-base-button';
import { EditKnowledgeBaseButton } from '../../components/features/knowledge-base/edit-knowledge-base-button';
import { DeleteKnowledgeBaseButton } from '../../components/features/knowledge-base/delete-knowledge-base-button';
import { useGetKnowledgeBases } from '@/hooks/service/knowledgebase';

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
            <EditKnowledgeBaseButton />
            <DeleteKnowledgeBaseButton />
          </div>
          <div>
            <div>
              <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
            </div>
          </div>
        </div>
        <div>
          <Table
            useClientPagination
            useMultiSelect
            columns={columns}
            data={knowledgeBases}
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
      <Link to={'/knowledge-base/test'} className="table-td-link">
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
    id: 'creator',
    header: '생성자',
    accessorFn: (row) => row.creator,
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
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.desc,
    size: 271,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 225,
  },
];
