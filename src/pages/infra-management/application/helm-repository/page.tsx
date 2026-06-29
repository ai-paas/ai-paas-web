import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BreadCrumb,
  Button,
  SearchInput,
  Table,
  HeaderCheckbox,
  CellCheckbox,
  AlertDialog,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';

import { useGetHelmRepositories } from '@/hooks/service/helm';
import { formatDateTime } from '@/util/date';
import type { HelmRepository } from '@/types/helm';

const breadcrumbItems = [
  { label: '인프라 모니터' },
  { label: '애플리케이션' },
  { label: '헬름 저장소' },
];

export default function ApplicationHelmRepositoryPage() {
  const navigate = useNavigate();
  const [isIntegrateDialogOpen, setIsIntegrateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { searchValue, ...searchInputProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { repositories, isPending, isError, error } = useGetHelmRepositories();

  const filteredRepositories = useMemo(() => {
    if (!searchValue) return repositories;
    const keyword = searchValue.toLowerCase();
    return repositories.filter((repo) => {
      const values = [repo.name, repo.url, repo.status];
      return values.some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(keyword)
      );
    });
  }, [repositories, searchValue]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  const paginatedRepositories = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredRepositories.slice(startIndex, endIndex);
  }, [filteredRepositories, pagination.pageIndex, pagination.pageSize]);

  const selectedRepository = useMemo(() => {
    const selectedKeys = Object.keys(rowSelection);
    if (selectedKeys.length !== 1) return undefined;
    const index = Number(selectedKeys[0]);
    return paginatedRepositories[index];
  }, [rowSelection, paginatedRepositories]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        size: 30,
        enableSorting: false,
        header: ({ table }: { table: unknown }) => <HeaderCheckbox table={table} />,
        cell: ({ row }: { row: { original: HelmRepository } }) => <CellCheckbox row={row} />,
      },
      {
        id: 'name',
        header: '이름',
        accessorFn: (row: HelmRepository) => row.name ?? '-',
        size: 325,
        cell: ({ row }: { row: { original: HelmRepository } }) => {
          const name = row.original.name;
          if (!name) return '-';
          return (
            <Link
              to={`/infra-management/application/catalog?repository=${encodeURIComponent(name)}`}
              className="table-td-link"
            >
              {name}
            </Link>
          );
        },
      },
      {
        id: 'source',
        header: '종류',
        accessorFn: (row: HelmRepository) => row.source ?? '-',
        size: 140,
        cell: ({ row }: { row: { original: HelmRepository } }) => {
          const s = row.original.source;
          if (!s) return '-';
          const variant = s === 'INTERNAL' ? 'wait' : 'run';
          return <span className={`table-td-state table-td-state-${variant}`}>{s}</span>;
        },
      },
      {
        id: 'url',
        header: '저장소 URL',
        accessorFn: (row: HelmRepository) => row.url ?? '-',
        size: 400,
      },
      {
        id: 'tags',
        header: '태그',
        accessorFn: (row: HelmRepository) => row.tags ?? '-',
        size: 220,
      },
      {
        id: 'auth',
        header: '인증',
        accessorFn: (row: HelmRepository) => (row.username ? 'Basic Auth' : '-'),
        size: 100,
      },
      {
        id: 'insecure',
        header: 'TLS 우회',
        accessorFn: (row: HelmRepository) =>
          (row.insecureSkipTLSVerify ?? row.insecure) ? '예' : '아니오',
        size: 100,
      },
      {
        id: 'createdAt',
        header: '생성 일시',
        accessorFn: (row: HelmRepository) =>
          row.created || row.createdAt ? formatDateTime(row.created || row.createdAt || '') : '-',
        size: 180,
      },
    ],
    []
  );

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">헬름 저장소</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button size="medium" color="primary" onClick={() => setIsIntegrateDialogOpen(true)}>
              연동
            </Button>
            <Button
              size="medium"
              color="negative"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!selectedRepository}
            >
              삭제
            </Button>
          </div>
          <SearchInput
            variant="default"
            placeholder="저장소를 검색해주세요"
            {...searchInputProps}
          />
        </div>

        <div className="h-[520px]">
          <Table
            columns={columns}
            data={paginatedRepositories}
            isLoading={isPending}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                <div className="flex flex-col items-center gap-4">
                  <div>헬름 저장소를 불러오는 중 오류가 발생했습니다.</div>
                  {error instanceof Error && <div>{error.message}</div>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>등록된 헬름 저장소가 없습니다.</div>
                  <div>저장소를 연동한 후 다시 확인해주세요.</div>
                </div>
              )
            }
            totalCount={filteredRepositories.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>

      <AlertDialog
        isOpen={isIntegrateDialogOpen}
        confirmButtonText="확인"
        cancelButtonText={undefined}
        onClickConfirm={() => setIsIntegrateDialogOpen(false)}
        onClickClose={() => setIsIntegrateDialogOpen(false)}
      >
        <div className="flex flex-col gap-2 text-center">
          <strong>헬름 저장소 연동</strong>
          <span>저장소 연동 기능은 API 연동이 완료되면 제공될 예정입니다.</span>
        </div>
      </AlertDialog>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={() => setIsDeleteDialogOpen(false)}
        onClickClose={() => setIsDeleteDialogOpen(false)}
      >
        <div className="flex flex-col gap-2 text-center">
          <strong>헬름 저장소 삭제</strong>
          {selectedRepository ? (
            <span>{selectedRepository.name ?? '-'} 저장소 삭제 기능은 API 연동 후 지원됩니다.</span>
          ) : (
            <span>삭제할 저장소를 선택해주세요.</span>
          )}
        </div>
      </AlertDialog>
    </main>
  );
}
