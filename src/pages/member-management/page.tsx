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
} from "innogrid-ui";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useGetMembers } from "@/hooks/service/member";
import { formatDateTime } from "@/util/date";

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
    id: "select",
    size: 30,
    header: ({ table }: {table: MemberRow}) => <HeaderCheckbox table={table} />,
    cell: ({ row }: {row: {original: MemberRow}}) => {
      // 행 디버깅
      console.log("row.original", row.original);
      return <CellCheckbox row={row} />;
    },
    enableSorting: false,
  },
  {
    id: "member_id",
    header: "아이디",
    accessorFn: (row: MemberRow) => row.member_id,
    size: 240,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <Link to={`/member-management/${row.original.member_id}`} className="table-td-link">
        {row.original.member_id}
      </Link>
    ),
  },
  {
    id: "name",
    header: "이름",
    accessorFn: (row: MemberRow) => row.name,
    size: 240,
  },
  {
    id: "email",
    header: "이메일",
    accessorFn: (row: MemberRow) => row.email,
    size: 220,
    enableSorting: false
  },
  {
    id: "phone",
    header: "연락처",
    accessorFn: (row: MemberRow) => row.phone,
    size: 220,
    cell: ({ row }: { row: { original: MemberRow } }) => {
    const raw = row.original.phone

    // 정규식으로 01012345678 → 010-1234-5678
    const formatted = raw.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");

    return <span>{formatted}</span>;
  },
  enableSorting: false
  },
  {
    id: "is_active",
    header: "상태",
    accessorFn: (row: MemberRow) => row.is_active,
    size: 220,
    cell: ({ row }: { row: { original: MemberRow } }) => {
    const active =
      row.original.is_active === true;

    return (
      <span className={`table-td-state ${active ? "table-td-state-run" : "table-td-state-temp"}`}>
        {active ? "활성화" : "비활성"} 
      </span>
    );
  },
  },
    {
    id: "last_login",
    header: "최종 접속 일시",
    accessorFn: (row: MemberRow) => formatDateTime(row.last_login),
    size: 220,
  },
  {
    id: "created_at",
    header: "생성일시",
    accessorFn: (row: MemberRow) => formatDateTime(row.created_at),
    size: 220,
  },
];

export default function MemberManagementPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();;

    const { members, page, isPending, isError } = useGetMembers({
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: searchValue,
    });

  const [sorting, setSorting] = useState<Sorting>([{ id: "name", desc: false }]);

  const { members = [], isPending, isError } = useGetMembers(); 
  const rows: MemberRow[] = members;

  // 선택된 단일 ID (멀티선택이면 null)
  const selectedId = useMemo(() => {
    const keys = Object.keys(rowSelection);
    if (keys.length !== 1) return null;
    const key = keys[0];
    // 행 키가 id와 동일하다고 가정. (Table이 rowKey/getRowId를 지원하면 꼭 설정해 주세요)
    return key;
  }, [rowSelection]);

  return (
    <main>
      <BreadCrumb items={[{ label: "멤버 관리" }]} className="breadcrumbBox" />
      <div className="page-title-box">
        <h2 className="page-title">멤버 관리</h2>
      </div>

      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns" />
          <div>
            <SearchInput
              variant="default"
              placeholder="검색어를 입력해주세요"
              {...restProps}
            />
          </div>
        </div>

        <div>
          <Table<MemberRow>
            useClientPagination
            useMultiSelect
            columns={columns}
            data={rows}
            isLoading={isPending}
            globalFilter={searchValue}
            totalCount={rows.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            sorting={sorting}
            setSorting={setSorting}
            // ✅ 지원된다면 실제 PK를 row key로: getRowId={(row) => String(row.id)}
          />
        </div>

        {isError && <div className="mt-4 text-red-500">멤버 목록을 불러오지 못했습니다.</div>}
      </div>
    </main>
  );
}

