import { useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  BreadCrumb,
  SearchInput,
  Table,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
  useSearchInputState,
} from '@innogrid/ui';

import { EditClusterButton } from '@/components/features/infra-managememt/cluster-management/edit-cluster-button';
import { CreateClusterButton } from '@/components/features/infra-managememt/cluster-management/create-cluster-button';
import { DeleteClusterButton } from '@/components/features/infra-managememt/cluster-management/delete-cluster-button';
import { formatDateTime } from '@/util/date';
import { useGetClusters } from '@/hooks/service/clusters';
import type { Cluster } from '@/types/cluster';

// 테이블 컬럼 설정
const columns = [
  {
    id: 'select',
    size: 50,
    header: ({ table }: { table: Cluster }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: Cluster }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Cluster) => row.id,
    size: 200,
    cell: ({ row }: { row: { original: Cluster } }) => (
      <Link
        to={`/infra-management/cluster-management/${row.original.id}`}
        className="table-td-link"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    id: 'connectionStatus',
    header: '연동 상태',
    accessorFn: (row: Cluster) => (row.monitServerUrl ? '연결됨' : '연결 안됨'),
    size: 150,
    cell: ({ row }: { row: { original: Cluster } }) => {
      const status = row.original.monitServerUrl ? '연결됨' : '연결 안됨';
      return (
        <span
          className={`table-td-state table-td-state-${status === '연결됨' ? 'run' : 'negative'}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'type',
    header: '유형',
    accessorFn: (row: Cluster) => row.clusterType || '-',
    size: 150,
  },
  {
    id: 'provider',
    header: '프로바이더',
    accessorFn: (row: Cluster) => row.clusterProvider || '-',
    size: 150,
  },
  {
    id: 'version',
    header: '쿠버네티스 버전',
    accessorFn: (row: Cluster) => row.version || '-',
    size: 200,
  },
  {
    id: 'apiServerUrl',
    header: 'API 서버 URL',
    accessorFn: (row: Cluster) => row.apiServerUrl,
    size: 300,
  },
  {
    id: 'createdAt',
    header: '생성 일시',
    accessorFn: (row: Cluster) => formatDateTime(row.createdAt),
    size: 200,
  },
];

export default function ClusterManagementPage() {
  const { searchValue, ...restProps } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();

  // API에서 클러스터 데이터 가져오기
  const { clusters: allClusters, isPending, isError } = useGetClusters();

  // 클라이언트 사이드 검색 필터링
  const filteredClusters = useMemo(() => {
    if (!searchValue) return allClusters;

    return allClusters.filter(
      (cluster) =>
        cluster.id.toLowerCase().includes(searchValue.toLowerCase()) ||
        cluster.apiServerUrl.toLowerCase().includes(searchValue.toLowerCase()) ||
        (cluster.version && cluster.version.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [allClusters, searchValue]);

  // 클라이언트 사이드 페이지네이션
  const clusters = useMemo(() => {
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredClusters.slice(startIndex, endIndex);
  }, [filteredClusters, pagination.pageIndex, pagination.pageSize]);

  // 선택된 행의 ID를 추출
  const selectedId = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);

    // 단일 선택만 허용
    if (selectedRowKeys.length !== 1) return null;

    return clusters[parseInt(selectedRowKeys[0])]?.id || null;
  }, [rowSelection, clusters]);

  // 검색어가 변경되면 페이지네이션 초기화
  useEffect(() => {
    if (searchValue) {
      initializePagination();
    }
  }, [searchValue, initializePagination]);

  // 삭제 성공 시 체크박스 선택 상태 초기화
  const handleDeleteSuccess = () => {
    setRowSelection({});
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '인프라 관리' }, { label: '클러스터 관리' }]}
        className="breadcrumbBox"
      />
      <div className="page-title-box">
        <h2 className="page-title">클러스터 관리</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <CreateClusterButton />
            <EditClusterButton clusterId={selectedId} />
            <DeleteClusterButton clusterId={selectedId} onDeleteSuccess={handleDeleteSuccess} />
          </div>
          <div>
            <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
          </div>
        </div>
        <div className="h-[481px]">
          <Table
            columns={columns}
            data={clusters}
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
                '클러스터 목록을 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>클러스터가 없습니다.</div>
                  <div>생성 버튼을 클릭해 클러스터를 생성해 보세요.</div>
                </div>
              )
            }
            totalCount={filteredClusters.length}
            pagination={pagination}
            setPagination={setPagination}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>
      </div>
    </main>
  );
}
