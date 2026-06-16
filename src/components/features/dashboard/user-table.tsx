import { Table } from '@innogrid/ui';

import { useGetMembers } from '@/hooks/service/member';
import type { Member } from '@/types/member';
import { formatDateTime } from '@/util/date';

const USER_SIZE = 5;

const roleLabel: Record<string, string> = {
  admin: '관리자',
  user: '사용자',
};

const userColumns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Member) => row.name,
    size: 200,
  },
  {
    id: 'role',
    header: '권한',
    accessorFn: (row: Member) => roleLabel[row.role] ?? row.role,
    size: 200,
  },
  {
    id: 'email',
    header: '이메일 주소',
    accessorFn: (row: Member) => row.email,
    size: 200,
  },
  {
    id: 'date',
    header: '생성일시',
    accessorFn: (row: Member) => formatDateTime(row.created_at),
    size: 200,
  },
];

// 관리자: 회원 목록
export const UserTable = () => {
  const { members, isPending } = useGetMembers({ size: USER_SIZE });

  return (
    <Table
      usePagination={false}
      columns={userColumns}
      data={members}
      isLoading={isPending}
      totalCount={members.length}
    />
  );
};
