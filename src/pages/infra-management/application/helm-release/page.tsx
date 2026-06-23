import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BreadCrumb,
  Button,
  Select,
  SearchInput,
  Table,
  HeaderCheckbox,
  CellCheckbox,
  AlertDialog,
  useSearchInputState,
  useTablePagination,
  useTableSelection,
  type SelectSingleValue,
} from '@innogrid/ui';

import { useGetClusters } from '@/hooks/service/clusters';
import { useGetHelmReleases } from '@/hooks/service/helm';
import { formatDateTime } from '@/util/date';
import type { HelmRelease } from '@/types/helm';

type OptionType = { text: string; value: string };
type ClusterSelectOption = OptionType & { createdAt?: string };

const breadcrumbItems = [
  { label: '인프라 모니터' },
  { label: '애플리케이션' },
  { label: '헬름 릴리즈' },
];

const normalizeStatus = (status?: string) => {
  if (!status) {
    return { label: '-', variant: 'temp' as const };
  }

  const normalized = status.trim().toLowerCase();

  if (['deployed', 'deploy', 'success', 'succeeded', 'completed', 'active'].includes(normalized)) {
    return { label: 'Deployed', variant: 'run' as const };
  }

  if (['failed', 'error', 'errored', 'uninstalling'].includes(normalized)) {
    return { label: 'Failed', variant: 'negative' as const };
  }

  if (['pending', 'installing', 'progressing', 'upgrading'].includes(normalized)) {
    return { label: 'Pending', variant: 'ing' as const };
  }

  if (['deleted', 'superseded'].includes(normalized)) {
    return { label: 'Deleted', variant: 'temp' as const };
  }

  return { label: status, variant: 'temp' as const };
};

const getClusterOption = (
  clusterId?: string | null,
  description?: string | null
): OptionType | null => {
  const id = clusterId?.trim();
  const desc = description?.trim();

  if (!id && !desc) {
    return null;
  }

  const value = id ?? desc!;
  const text = desc && id && desc !== id ? `${value} (${desc})` : value;

  return { text, value };
};

export default function ApplicationHelmReleasePage() {
  const navigate = useNavigate();
  const [selectedCluster, setSelectedCluster] = useState<OptionType>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { searchValue, ...searchInputProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  const { clusters, isPending: isClustersPending, isError: isClusterError } = useGetClusters();

  const clusterOptions = useMemo(() => {
    if (!clusters || clusters.length === 0) return [];

    const result: ClusterSelectOption[] = [];

    clusters.forEach((cluster) => {
      const name = cluster.clusterName;
      if (!name) return;
      const option = getClusterOption(name, cluster.description);
      const value = name;
      if (!result.some((existing) => existing.value === value)) {
        result.push({
          text: option?.text ?? name,
          value,
          createdAt: cluster.createdAt,
        });
      }
    });

    return result;
  }, [clusters]);

  useEffect(() => {
    if (!clusterOptions.length) return;

    // 현재 선택된 클러스터가 옵션 목록에 존재하면 유지
    if (
      selectedCluster &&
      clusterOptions.some((option) => option.value === selectedCluster.value)
    ) {
      // 옵션에 존재하는 경우 텍스트만 최신화
      const matchedOption = clusterOptions.find((option) => option.value === selectedCluster.value);
      if (matchedOption && matchedOption.text !== selectedCluster.text) {
        setSelectedCluster({ text: matchedOption.text, value: matchedOption.value });
      }
      return;
    }

    // 최신 생성 클러스터를 기본값으로 선택
    const latestCluster = [...clusterOptions].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })[0];

    if (latestCluster) {
      setSelectedCluster({ text: latestCluster.text, value: latestCluster.value });
    }
  }, [clusterOptions, selectedCluster]);

  const { releases, isPending, isError, error } = useGetHelmReleases({
    clusterId: selectedCluster?.value,
  });

  const normalizedClusterOptions: OptionType[] = useMemo(
    () =>
      clusterOptions.map((option) => ({
        text: option.text,
        value: option.value,
      })),
    [clusterOptions]
  );

  const handleClusterChange = (option: SelectSingleValue<OptionType>) => {
    if (!option) return;
    setSelectedCluster(option as OptionType);
    setRowSelection({});
    initializePagination();
  };

  const filteredReleases = useMemo(() => {
    if (!searchValue) return releases;
    const keyword = searchValue.toLowerCase();
    return releases.filter((release) => {
      const values = [
        release.name,
        release.namespace,
        release.status,
        release.chart,
        release.chartVersion,
      ];
      return values.some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(keyword)
      );
    });
  }, [releases, searchValue]);

  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  const paginatedReleases = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredReleases.slice(startIndex, endIndex);
  }, [filteredReleases, pagination.pageIndex, pagination.pageSize]);

  const selectedRelease = useMemo(() => {
    const selectedKeys = Object.keys(rowSelection);
    if (selectedKeys.length !== 1) return undefined;
    const index = Number(selectedKeys[0]);
    return paginatedReleases[index];
  }, [rowSelection, paginatedReleases]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        size: 48,
        enableSorting: false,
        header: ({ table }: { table: unknown }) => <HeaderCheckbox table={table} />,
        cell: ({ row }: { row: { original: HelmRelease } }) => <CellCheckbox row={row} />,
      },
      {
        id: 'name',
        header: '이름',
        accessorFn: (row: HelmRelease) => row.name ?? '-',
        size: 200,
        cell: ({ row }: { row: { original: HelmRelease } }) => {
          const release = row.original;
          if (!release.name || !release.namespace) {
            return <span>{release.name ?? '-'}</span>;
          }
          // 클러스터 정보를 쿼리 파라미터로 전달
          const clusterParam = selectedCluster?.value
            ? `?clusterId=${encodeURIComponent(selectedCluster.value)}`
            : '';
          return (
            <Link
              to={`/infra-management/application/helm-release/${release.namespace}/${release.name}${clusterParam}`}
              className="table-td-link"
            >
              {release.name}
            </Link>
          );
        },
      },
      {
        id: 'namespace',
        header: '네임스페이스',
        accessorFn: (row: HelmRelease) => row.namespace ?? '-',
        size: 200,
      },
      {
        id: 'status',
        header: '배포 상태',
        accessorFn: (row: HelmRelease) => row.status ?? '-',
        size: 160,
        cell: ({ row }: { row: { original: HelmRelease } }) => {
          const meta = normalizeStatus(row.original.status);
          return (
            <span className={`table-td-state table-td-state-${meta.variant}`}>{meta.label}</span>
          );
        },
      },
      {
        id: 'revision',
        header: '리비전',
        accessorFn: (row: HelmRelease) =>
          typeof row.revision === 'number' ? row.revision : (row.revision ?? '-'),
        size: 120,
      },
      {
        id: 'chartName',
        header: '차트 이름',
        accessorFn: (row: HelmRelease) => row.chart ?? '-',
        size: 200,
      },
      {
        id: 'chartVersion',
        header: '차트 버전',
        accessorFn: (row: HelmRelease) => row.chartVersion ?? '-',
        size: 160,
      },
      {
        id: 'createdAt',
        header: '생성 일시',
        accessorFn: (row: HelmRelease) =>
          row.created || row.createdAt ? formatDateTime(row.created || row.createdAt || '') : '-',
        size: 200,
      },
      {
        id: 'updatedAt',
        header: '최근 업데이트',
        accessorFn: (row: HelmRelease) =>
          row.updated || row.updatedAt ? formatDateTime(row.updated || row.updatedAt || '') : '-',
        size: 200,
      },
    ],
    [selectedCluster]
  );

  const isLoading = isPending || isClustersPending;

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">헬름 릴리즈</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <Button
              size="medium"
              color="primary"
              onClick={() => navigate('/infra-management/application/helm-release/create')}
            >
              생성
            </Button>
            <Button
              size="medium"
              color="negative"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!selectedRelease}
            >
              삭제
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="page-input_item-box">
              <Select
                isLoading={isClustersPending}
                placeholder="클러스터를 선택해주세요"
                options={normalizedClusterOptions}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={selectedCluster}
                onChange={handleClusterChange}
                size="small"
              />
            </div>
            <SearchInput
              variant="default"
              placeholder="릴리즈를 검색해주세요"
              {...searchInputProps}
            />
          </div>
        </div>

        <div className="h-[520px]">
          <Table
            columns={columns}
            data={paginatedReleases}
            isLoading={isLoading}
            globalFilter={searchValue}
            emptySearchMessage={
              <div className="flex flex-col items-center gap-4">
                <div>검색 결과가 없습니다.</div>
              </div>
            }
            emptyMessage={
              isError ? (
                <div className="flex flex-col items-center gap-4">
                  <div>헬름 릴리즈를 불러오는 중 오류가 발생했습니다.</div>
                  {error instanceof Error && <div>{error.message}</div>}
                </div>
              ) : isClusterError ? (
                <div className="flex flex-col items-center gap-4">
                  <div>클러스터 정보를 불러오지 못했습니다.</div>
                  <div>권한을 확인하거나 잠시 후 다시 시도해주세요.</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>등록된 헬름 릴리즈가 없습니다.</div>
                  <div>릴리즈를 배포한 후 다시 확인해주세요.</div>
                </div>
              )
            }
            totalCount={filteredReleases.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={() => setIsDeleteDialogOpen(false)}
        onClickClose={() => setIsDeleteDialogOpen(false)}
      >
        <div className="flex flex-col gap-2 text-center">
          <strong>헬름 릴리즈 삭제</strong>
          {selectedRelease ? (
            <span>
              {selectedRelease.namespace ?? '-'} / {selectedRelease.name ?? '-'} 릴리즈 삭제 기능은
              API 연동 후 지원됩니다.
            </span>
          ) : (
            <span>삭제할 릴리즈를 선택해주세요.</span>
          )}
        </div>
      </AlertDialog>
    </main>
  );
}
