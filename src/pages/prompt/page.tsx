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
import { CreatePromptButton } from '../../components/features/prompt/create-prompt-button';
import { EditPromptButton } from '../../components/features/prompt/edit-prompt-button';
import { DeletePromptButton } from '../../components/features/prompt/delete-prompt-button';

export default function PromptPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

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
            <DeletePromptButton />
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
    size: 352,
    cell: ({ row }) => (
      <Link to={'/prompt/test'} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'variable',
    header: '변수',
    accessorFn: (row) => row.variable,
    size: 230,
  },
  {
    id: 'creator',
    header: '생성자',
    accessorFn: (row) => row.creator,
    size: 230,
  },
  {
    id: 'capacity',
    header: '용량',
    accessorFn: (row) => row.capacity,
    size: 230,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.desc,
    size: 362,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 362,
  },
];

const data = [
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: '프롬프트 001',
    variable: '3개',
    creator: '사용자 001',
    capacity: '32.5B',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
];
