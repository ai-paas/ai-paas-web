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
import { CreateLearningButton } from '../../components/features/learning/create-learning-button';
import { EditLearningButton } from '../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../components/features/learning/delete-learning-button';
import { ModelRegisterButton } from '@/components/features/knowledge-base/model-register-button';

export default function LearningPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { setRowSelection, rowSelection } = useTableSelection();
  const { pagination, setPagination } = useTablePagination();
  const [sorting, setSorting] = useState<Sorting>([{ id: 'name', desc: false }]);

  return (
    <main>
      <BreadCrumb items={[{ label: '학습' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">학습</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateLearningButton />
            <EditLearningButton />
            <DeleteLearningButton />
            <ModelRegisterButton />
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
      <Link to={'/learning/test'} className="table-td-link">
        {row.original.name}
      </Link>
    ),
  },
  {
    id: 'id',
    header: 'ID',
    accessorFn: (row) => row.id,
    size: 170,
  },
  {
    id: 'creator',
    header: '생성자',
    accessorFn: (row) => row.creator,
    size: 170,
  },
  {
    id: 'type',
    header: '모델 타입',
    accessorFn: (row) => row.type,
    size: 200,
    enableSorting: false, //오름차순/내림차순 아이콘 숨기기
  },
  {
    id: 'register',
    header: '모델 등록',
    accessorFn: (row) => row.register,
    size: 170,
    cell: ({ row }) => (
      <span className="table-td-state table-td-state-run">{row.original.status}</span>
    ),
  },
  {
    id: 'status',
    header: '상태',
    accessorFn: (row) => row.status,
    size: 170,
    cell: ({ row }) => (
      <span className="table-td-state table-td-state-run">{row.original.status}</span>
    ),
  },
  {
    id: 'desc',
    header: '설명',
    accessorFn: (row) => row.desc,
    size: 225,
  },
  {
    id: 'elapsed',
    header: '경과 시간',
    accessorFn: (row) => row.elapsed,
    size: 200,
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
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
  {
    name: '테스트 학습 001',
    id: 'ID Sample',
    creator: '사용자 001',
    type: 'Custom',
    register: '완료',
    status: '완료',
    desc: '설명이 들어갑니다. 설명이 들어갑니다.',
    elapsed: '02:45:00',
    date: '2025-12-31 10:12',
  },
];
