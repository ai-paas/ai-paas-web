import {
  BreadCrumb,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
  type Sorting,
} from '@innogrid/ui';
import { useState } from 'react';
import { Link } from 'react-router';
import { CreateKnowledgeBaseButton } from '../../components/features/knowledge-base/create-knowledge-base-button';
import { EditKnowledgeBaseButton } from '../../components/features/knowledge-base/edit-knowledge-base-button';
import { DeleteKnowledgeBaseButton } from '../../components/features/knowledge-base/delete-knowledge-base-button';

export default function KnowledgeBasePage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

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
            data={data}
            totalCount={data.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            setSorting={setSorting}
            sorting={sorting}
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
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
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

const data = [
  {
    name: '테스트 문서 001',
    tag: 'ML',
    creator: '홍길동',
    service: '32.5B',
    status: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 문서 001',
    tag: 'ML',
    creator: '홍길동',
    service: '32.5B',
    status: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 문서 001',
    tag: 'ML',
    creator: '홍길동',
    service: '32.5B',
    status: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
];
