import { CellCheckbox, HeaderCheckbox } from '@innogrid/ui';
import { ListPage, useListPageState } from '@/components/ui/list-page';
import { useEffect } from 'react';
import { Link } from 'react-router';
import { useGetMembers } from '@/hooks/service/member';
import { formatDateTime } from '@/util/date';
import { formatPhone } from '@/util/phone';
import { CreateMemberButton } from '@/components/features/member-management/create-member-button';
import { DeleteMemberButton } from '@/components/features/member-management/delete-member-button';
import { EditMemberButton } from '@/components/features/member-management/edit-member-button';
import { ActivateMemberButton } from '@/components/features/member-management/activate-member-button';
import { DeactivateMemberButton } from '@/components/features/member-management/deactivate-member-button';

interface MemberRow {
  id: number | string;
  name: string;
  member_id: string;
  email: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  description?: string | null;
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
    accessorFn: (row: MemberRow) => formatPhone(row.phone ?? undefined),
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
  const list = useListPageState();
  const { members, page, isPending, isError, error } = useGetMembers(list.queryParams);
  const selectedMember = list.getSelectedRow(members);
  const selectedMemberId = selectedMember?.member_id ?? null;
  const { setRowSelection } = list;

  useEffect(() => {
    setRowSelection({}); // 데이터 갱신 시 체크 해제
  }, [members, setRowSelection]);

  return (
    <ListPage
      title="멤버 관리"
      listState={list}
      actions={
        <>
          <CreateMemberButton />
          <EditMemberButton selectedMemberId={selectedMemberId} />
          <DeleteMemberButton selectedMemberId={selectedMemberId} />
          <ActivateMemberButton
            selectedMemberId={selectedMemberId}
            selectedIsActive={selectedMember?.is_active ?? null}
          />
          <DeactivateMemberButton
            selectedMemberId={selectedMemberId}
            selectedIsActive={selectedMember?.is_active ?? null}
          />
        </>
      }
      columns={columns}
      data={members}
      totalCount={page.total}
      isLoading={isPending}
      isError={isError}
      error={error}
      errorMessage="멤버 목록을 불러오는 데 실패했습니다."
      emptyTitle="멤버가 없습니다."
      emptyDescription="생성 버튼을 클릭해 멤버를 생성해 보세요."
    />
  );
}
