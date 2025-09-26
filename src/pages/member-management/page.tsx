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
import { useGetMembers } from '@/hooks/service/member';
import { formatDateTime } from '@/util/date';
import { formatPhone } from '@/util/phone';
import { CreateMemberButton } from '@/components/features/member-management/create-member-button';
import { DeleteMemberButton } from '@/components/features/member-management/delete-member-button';
import { EditMemberButton } from '@/components/features/member-management/edit-member-button';

interface MemberRow {
  id: number | string;
  name: string;
  member_id: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  description: string;
}

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: MemberRow }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: MemberRow } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'member_id',
    header: '아이디',
    accessorFn: (row: MemberRow) => row.member_id,
    size: 242,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <Link to={`/member-management/${row.original.member_id}`} className="table-td-link">
        {row.original.member_id}
      </Link>
    ),
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: MemberRow) => row.name,
    size: 242,
  },
  {
    id: 'email',
    header: '이메일',
    accessorFn: (row: MemberRow) => row.email,
    size: 242,
    enableSorting: false,
  },
  {
    id: 'phone',
    header: '연락처',
    accessorFn: (row: MemberRow) => formatPhone(row.phone),
    size: 242,
    enableSorting: false,
  },
  {
    id: 'is_active',
    header: '상태',
    accessorFn: (row: MemberRow) => row.is_active,
    size: 242,
    cell: ({ row }: { row: { original: MemberRow } }) => {
      const active = row.original.is_active === true;

      return (
        <span className={`table-td-state ${active ? 'table-td-state-run' : 'table-td-state-temp'}`}>
          {active ? '활성화' : '비활성'}
        </span>
      );
    },
  },
  {
    id: 'last_login',
    header: '최종 접속 일시',
    accessorFn: (row: MemberRow) => formatDateTime(row.last_login),
    size: 242,
  },
  {
    id: 'created_at',
    header: '생성일시',
    accessorFn: (row: MemberRow) => formatDateTime(row.created_at),
    size: 242,
  },
];

export default function MemberManagementPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { members, page, isPending, isError } = useGetMembers({
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    search: searchValue,
  });

  const selectedMemberId = useMemo(() => {
    if (!members?.length) return null;

    const keys = Object.keys(rowSelection);
    if (keys.length !== 1) return null;

    const idx = Number(keys[0]);
    if (!Number.isFinite(idx) || idx < 0 || idx >= members.length) return null;

    return members[idx].member_id; // 문자열 그대로 반환
  }, [rowSelection, members]);

  console.log('selectedMemberId: ', selectedMemberId);

  // 검색어가 변경되면 페이지네이션 초기화
  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  useEffect(() => {
    setRowSelection({}); // 데이터 갱신 시 체크 해제
  }, [members, setRowSelection]);

  return (
    <main>
      <BreadCrumb items={[{ label: '멤버 관리' }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">멤버 관리</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateMemberButton />
            <EditMemberButton selectedMemberId={selectedMemberId} />
            <DeleteMemberButton selectedMemberId={selectedMemberId} />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={members}
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
                '멤버 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>멤버가 없습니다.</div>
                  <div>생성 버튼을 클릭해 멤버를 생성해 보세요.</div>
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

        {isError && <div className="mt-4 text-red-500">멤버 목록을 불러오지 못했습니다.</div>}
      </div>
    </main>
  );
}
