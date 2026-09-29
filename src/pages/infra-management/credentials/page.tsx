import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useCheckCredentialHealth,
  refreshCredentialHealth,
  type Credential,
  type CredentialHealth,
} from '@/hooks/service/credentials';
import { formatDateTime, formatRelativeTime } from '@/util/date';
import { CredentialValuesModal } from '@/components/features/infra-management/credentials/credential-values-modal';
import { CredentialEditModal } from '@/components/features/infra-management/credentials/credential-edit-modal';
import { errorMessage } from '@/util/api-error';
import { StatusBadge } from '@/components/ui/status-badge';

const credentialKey = (c: Credential | undefined): string => c?.id ?? c?.name ?? '';

interface HealthEntry {
  health: CredentialHealth;
  checkedAt: number;
}

const buildColumns = (
  healthById: Record<string, HealthEntry>,
  checkingId: string | undefined,
  onCheck: (credentialId: string) => void,
  onShowValues: (credential: Credential) => void
) => [
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
    header: '등록된 값',
    accessorFn: (row: Credential) => row.credentialKeys?.length ?? 0,
    enableSorting: false,
    size: 160,
    // 값을 표에 펼치면 키가 많은 자격증명이 행 높이를 밀어내 표가 읽히지 않는다.
    cell: ({ row }: { row: { original: Credential } }) => {
      const keys = row.original.credentialKeys ?? [];
      if (keys.length === 0) return '-';
      return (
        <div className="table-td-inline">
          <span>{keys.length}개</span>
          <button
            type="button"
            className="table-td-inline-btn"
            onClick={(e) => {
              e.stopPropagation();
              onShowValues(row.original);
            }}
          >
            보기
          </button>
        </div>
      );
    },
  },
  {
    id: 'createdAt',
    header: '생성 일시',
    accessorFn: (row: Credential) => formatDateTime(row.createdAt as string | undefined),
    size: 180,
  },
  {
    id: 'health',
    header: '상태',
    accessorFn: (row: Credential) =>
      healthById[row.id ?? '']?.health.healthy ?? row.healthStatus ?? '',
    size: 230,
    enableSorting: false,
    // 등록만 하고 쓸 수 있는지는 프로비저닝을 걸어봐야 알았다. 확인은 CSP API 를 실제로 부른다.
    // 방금 확인한 결과가 있으면 그걸, 없으면 서버에 저장된 결과를 쓴다.
    cell: ({ row }: { row: { original: Credential } }) => {
      const c = row.original;
      const id = c.id ?? '';
      const fresh = healthById[id]?.health;
      const healthy = fresh ? fresh.healthy : c.healthStatus === 'HEALTHY';
      const known = fresh !== undefined || c.healthStatus !== undefined;
      // 검증 방법이 없는 프로바이더는 모른다고 말해야 한다. 실패로 칠하면 멀쩡한
      // 자격증명이 빨갛게 보여 진짜 실패를 무시하게 된다.
      const unverifiable =
        (fresh?.kind ?? c.healthKind) === 'NOT_VERIFIABLE' || c.healthStatus === 'UNKNOWN';
      const checkedAt = fresh?.checkedAt ?? c.healthCheckedAt;
      const checking = checkingId === id;

      return (
        // .table-td-state 는 display:flex 라 혼자 쓰일 때를 전제한다. 옆에 다른 요소를
        // 두려면 늘어나지 않게 flex:0 0 auto 로 묶어야 한다.
        <span className="table-td-inline">
          <span style={{ flex: '0 0 auto' }}>
            {known ? (
              <StatusBadge
                label={unverifiable ? '확인 불가' : healthy ? '정상' : '사용 불가'}
                tone={unverifiable ? 'temp' : healthy ? 'run' : 'negative'}
                title={fresh?.hint ?? fresh?.detail ?? c.healthDetail ?? ''}
              />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>미확인</span>
            )}
          </span>
          {/* 절대 시각은 폭을 많이 먹는다. 언제 기준인지만 알면 되므로 상대 시각을 쓰고
              정확한 시각은 tooltip 으로 남긴다. */}
          {checkedAt && (
            <span className="table-td-inline-muted" title={formatDateTime(checkedAt)}>
              {formatRelativeTime(checkedAt)}
            </span>
          )}
          <button
            type="button"
            className="table-td-inline-btn"
            disabled={checking || !id}
            onClick={(e) => {
              e.stopPropagation();
              onCheck(id);
            }}
          >
            {checking ? '확인 중' : '확인'}
          </button>
        </span>
      );
    },
  },
];

export default function CredentialsPage() {
  const { open } = useToast();
  const navigate = useNavigate();
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { credentials: allCredentials, isPending, isError } = useGetCredentials();

  // 확인 결과는 화면에만 둔다. 서버에 캐시하면 언제 확인한 값인지 알 수 없어진다.
  const [healthById, setHealthById] = useState<Record<string, HealthEntry>>({});
  const { checkHealth, checkingId } = useCheckCredentialHealth({
    onSuccess: (health, credentialId) => {
      setHealthById((prev) => ({ ...prev, [credentialId]: { health, checkedAt: Date.now() } }));
      open({
        title: health.healthy ? '자격증명이 정상입니다.' : '자격증명을 사용할 수 없습니다.',
        description: health.hint || undefined,
        status: health.healthy ? 'positive' : 'negative',
      });
    },
    onError: (e) => open({ title: errorMessage(e, '확인 실패'), status: 'negative' }),
  });

  const onCheck = useCallback(
    (credentialId: string) => checkHealth({ credentialId, mode: 'check' }),
    [checkHealth]
  );

  const [valuesOf, setValuesOf] = useState<Credential>();
  const [editing, setEditing] = useState<Credential>();

  const columns = useMemo(
    () => buildColumns(healthById, checkingId, onCheck, setValuesOf),
    [healthById, checkingId, onCheck]
  );

  // 화면에 들어오면 오래된 것만 다시 확인한다. 한꺼번에 던지면 CSP 요청 제한에 걸리므로
  // 하나씩 순서대로 부른다. 최근에 확인한 것은 서버가 저장값을 즉시 돌려준다.
  const autoRefreshed = useRef(false);
  useEffect(() => {
    if (autoRefreshed.current || allCredentials.length === 0) return;
    autoRefreshed.current = true;

    let cancelled = false;
    const ids = allCredentials.map((c) => c.id).filter((id): id is string => !!id);
    (async () => {
      for (const credentialId of ids) {
        if (cancelled) return;
        try {
          const health = await refreshCredentialHealth(credentialId);
          if (cancelled) return;
          setHealthById((prev) => ({ ...prev, [credentialId]: { health, checkedAt: Date.now() } }));
        } catch {
          // 한 건이 실패해도 나머지는 확인한다. 실패는 목록의 "미확인" 으로 남는다.
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allCredentials]);

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
      open({ title: errorMessage(e, '삭제 실패'), status: 'negative' });
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
      {editing && (
        <CredentialEditModal
          isOpen={!!editing}
          credential={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
      <CredentialValuesModal
        isOpen={!!valuesOf}
        credentialId={valuesOf?.id ?? ''}
        credentialName={valuesOf?.name ?? ''}
        keys={valuesOf?.credentialKeys ?? []}
        onClose={() => setValuesOf(undefined)}
      />
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '인프라 관리' }, { label: '설정' }, { label: '자격증명 관리' }]}
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
              color="secondary"
              size="medium"
              onClick={() => setEditing(selectedCredentials[0])}
              disabled={selectedCredentials.length !== 1}
            >
              수정
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
            useClientPagination
            useSelect
            useMultiSelect
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
