import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertDialog,
  BreadCrumb,
  Button,
  CellCheckbox,
  HeaderCheckbox,
  SearchInput,
  Table,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
  useToast,
} from '@innogrid/ui';
import {
  useGetCredentials,
  useDeleteCredential,
  type Credential,
} from '@/hooks/service/credentials';
import { formatDateTime } from '@/util/date';

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
};

const credentialKey = (c: Credential | undefined): string => c?.id ?? c?.name ?? '';

const columns = [
  {
    id: 'select',
    size: 50,
    header: ({ table }: { table: Credential }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Credential }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Credential) => row.name ?? '-',
    size: 200,
  },
  {
    id: 'provider',
    header: '프로바이더',
    accessorFn: (row: Credential) => row.provider ?? '-',
    size: 120,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: Credential) => row.description ?? '-',
    size: 280,
  },
  {
    id: 'keys',
    header: '키 목록',
    accessorFn: (row: Credential) => row.credentialKeys?.join(', ') ?? '-',
    size: 240,
  },
  {
    id: 'createdAt',
    header: '생성 일시',
    accessorFn: (row: Credential) => formatDateTime(row.createdAt as string | undefined),
    size: 180,
  },
];

export default function CredentialsPage() {
  const { open } = useToast();
  const navigate = useNavigate();
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { credentials: allCredentials, isPending, isError } = useGetCredentials();

  const filtered = useMemo(() => {
    if (!searchValue) return allCredentials;
    const needle = searchValue.toLowerCase();
    return allCredentials.filter((c) => {
      const fields = [c.name, c.provider, c.description];
      return fields.some((f) => (typeof f === 'string' ? f.toLowerCase().includes(needle) : false));
    });
  }, [allCredentials, searchValue]);

  const credentials = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.pageIndex, pagination.pageSize]);

  // 다중 선택 — 클러스터 관리와 동일 패턴
  const selectedCredentials = useMemo<Credential[]>(
    () =>
      Object.keys(rowSelection)
        .map((idx) => credentials[parseInt(idx, 10)])
        .filter((c): c is Credential => !!c),
    [credentials, rowSelection]
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { deleteCredential } = useDeleteCredential({
    onSuccess: () => {
      setPendingCount((c) => {
        const next = c - 1;
        if (next <= 0) {
          setIsDeleteOpen(false);
          setRowSelection({});
          open({ title: '자격증명이 삭제되었습니다.' });
        }
        return next;
      });
    },
    onError: (e) => {
      setPendingCount((c) => Math.max(0, c - 1));
      open({ title: extractErrorMessage(e, '삭제 실패'), status: 'negative' });
    },
  });

  const handleConfirmDelete = () => {
    const ids = selectedCredentials.map((c) => c.id).filter((id): id is string => !!id);
    if (ids.length === 0) return;
    setPendingCount(ids.length);
    ids.forEach((id) => deleteCredential(id));
  };

  useEffect(() => {
    if (searchValue) initializePagination();
  }, [searchValue, initializePagination]);

  const deletePending = pendingCount > 0;
  const deleteLabel = deletePending
    ? `삭제 중... (${pendingCount})`
    : selectedCredentials.length > 1
      ? `삭제 (${selectedCredentials.length})`
      : '삭제';

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '인프라 관리' }, { label: '시스템 설정' }, { label: '자격증명 관리' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">자격증명 관리</h2>
      </div>

      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button
              color="primary"
              size="medium"
              onClick={() => navigate('/infra-management/credentials/create')}
            >
              등록
            </Button>
            <Button
              color="negative"
              size="medium"
              onClick={() => setIsDeleteOpen(true)}
              disabled={selectedCredentials.length === 0 || deletePending}
            >
              {deleteLabel}
            </Button>
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={credentials}
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
                '자격증명 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>등록된 자격증명이 없습니다.</div>
                  <div>등록 버튼을 클릭해 CSP 자격증명을 추가해 보세요.</div>
                </div>
              )
            }
            totalCount={filtered.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>

        <AlertDialog
          isOpen={isDeleteOpen}
          confirmButtonText="확인"
          cancelButtonText="취소"
          onClickConfirm={handleConfirmDelete}
          onClickClose={() => setIsDeleteOpen(false)}
        >
          <span>
            {selectedCredentials.length > 1
              ? `선택된 ${selectedCredentials.length}개 자격증명을 삭제하시겠습니까?`
              : `자격증명 "${selectedCredentials[0]?.name ?? ''}" 을 삭제하시겠습니까?`}
          </span>
        </AlertDialog>
      </div>
    </main>
  );
}

// referenced via Credential type-only import elsewhere — keep clusterKey-style helper local.
void credentialKey;
