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
import { CreateDatasetButton } from '../../components/features/dataset/create-dataset-button';
import { EditDatasetButton } from '../../components/features/dataset/edit-dataset-button';
import { DeleteDatasetButton } from '../../components/features/dataset/delete-dataset-button';

export default function DatasetPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  return (
    <main>
      <BreadCrumb items={[{ label: '데이터 셋' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">데이터 셋</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateDatasetButton />
            <EditDatasetButton />
            <DeleteDatasetButton />
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
    size: 400,
    cell: ({ row }) => (
      <Link to={'/dataset/test'} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'creator',
    header: '생성자',
    accessorFn: (row) => row.creator,
    size: 400,
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.date,
    size: 400,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row) => row.date,
    size: 400,
  },
];

const data = [
  {
    name: 'Sample1',
    tag: 'Custom',
    creator: 'CustomA',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample2',
    tag: 'Custom',
    creator: 'CustomB',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample3',
    tag: 'Custom',
    creator: 'CustomC',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample4',
    tag: 'Custom',
    creator: 'CustomD',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample5',
    tag: 'Custom',
    creator: 'CustomE',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample6',
    tag: 'Custom',
    creator: 'CustomF',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample7',
    tag: 'Custom',
    creator: 'CustomG',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample8',
    tag: 'Custom',
    creator: 'CustomH',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample9',
    tag: 'Custom',
    creator: 'CustomI',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
  {
    name: 'Sample10',
    tag: 'Custom',
    creator: 'CustomJ',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    date: '2025-12-31 10:12',
  },
];
