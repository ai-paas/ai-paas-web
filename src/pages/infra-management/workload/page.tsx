import { useGetClusters, useGetKubernetesNamespaces } from '@/hooks/service/clusters';
import { useGetKubernetesPodsResource } from '@/hooks/service/monitoring';
import type { Cluster, KubernetesPod } from '@/types/cluster';
import {
  BreadCrumb,
  SearchInput,
  Select,
  Table,
  useSearchInputState,
  useTablePagination,
  type SelectSingleValue,
} from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';
import styles from '../inframonitor.module.scss';

type SelectOption = {
  text: string;
  value: string;
};

const buildClusterOptions = (clusters: Cluster[]): SelectOption[] =>
  clusters.map((cluster) => ({
    text: cluster.id,
    value: cluster.id,
  }));

const getLatestClusterOption = (clusters: Cluster[]) => buildClusterOptions(clusters)[0];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Running':
      return 'run';
    case 'Pending':
      return 'ing';
    case 'Terminating':
      return 'ing';
    case 'Succeeded':
      return 'temp';
    case 'Failed':
      return 'negative';
    case 'Unknown':
      return 'negative';
    default:
      return 'negative';
  }
};

const columns = [
  {
    id: 'status',
    header: '상태',
    accessorFn: (row: KubernetesPod) =>
      row.metadata.deletionTimestamp ? 'Terminating' : row.status.phase,
    size: 140,
    cell: ({ row }: { row: { getValue: (columnId: string) => string } }) => {
      const status = row.getValue('status');
      return (
        <span className={`table-td-state table-td-state-${getStatusVariant(status)}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: 'name',
    header: '파드 이름',
    accessorFn: (row: KubernetesPod) => row.metadata.name,
    size: 300,
  },
  {
    id: 'namespace',
    header: '네임스페이스',
    accessorFn: (row: KubernetesPod) => row.metadata.namespace,
    size: 250,
  },
  {
    id: 'scheduler',
    header: '스케줄러',
    accessorFn: (row: KubernetesPod) => row.spec.schedulerName ?? '-',
    size: 180,
  },
  {
    id: 'containers',
    header: '컨테이너',
    accessorFn: (row: KubernetesPod) => {
      const total = row.status.containerStatuses?.length ?? 0;
      const ready = (row.status.containerStatuses ?? []).filter((status) => status.ready).length;
      return `${ready}/${total}`;
    },
    size: 100,
  },
  {
    id: 'podIP',
    header: 'IP',
    accessorFn: (row: KubernetesPod) => row.status.podIP ?? '-',
    size: 160,
  },
  {
    id: 'nodeName',
    header: '노드',
    accessorFn: (row: KubernetesPod) => row.spec.nodeName ?? '-',
    size: 250,
  },
  {
    id: 'createdAt',
    header: '생성일시',
    accessorFn: (row: KubernetesPod) => row.metadata.creationTimestamp,
    size: 160,
  },
];

const WorkloadPage = () => {
  const {
    searchValue,
    value: searchInputValue,
    onChange: onSearchInputChange,
    onSearch: onSearchInputSearch,
  } = useSearchInputState();
  const { pagination, setPagination, initializePagination } = useTablePagination();

  const { clusters, isPending: isClustersPending } = useGetClusters();
  const clusterOptions = useMemo(() => buildClusterOptions(clusters), [clusters]);
  const [selectedCluster, setSelectedCluster] = useState<SelectOption>();
  const [selectedNamespace, setSelectedNamespace] = useState<SelectOption>({
    text: '전체',
    value: '',
  });

  useEffect(() => {
    if (!clusterOptions.length) {
      let shouldInitializePagination = false;

      if (selectedCluster) {
        setSelectedCluster(undefined);
        shouldInitializePagination = true;
      }

      if (selectedNamespace.value) {
        setSelectedNamespace({ text: '전체', value: '' });
        shouldInitializePagination = true;
      }

      if (shouldInitializePagination) {
        initializePagination();
      }

      return;
    }

    if (selectedCluster && clusterOptions.some((option) => option.value === selectedCluster.value))
      return;
    setSelectedCluster(getLatestClusterOption(clusters));
  }, [clusterOptions, clusters, initializePagination, selectedCluster, selectedNamespace.value]);

  const { namespaces, isPending: isNamespacesPending } = useGetKubernetesNamespaces(
    selectedCluster?.value
  );
  const {
    pods: allPods,
    isPending: isPodsPending,
    isError,
  } = useGetKubernetesPodsResource(selectedCluster?.value, selectedNamespace.value);

  const namespaceOptions = useMemo<SelectOption[]>(() => {
    return [
      { text: '전체', value: '' },
      ...namespaces.map((namespace) => {
        const name = namespace.metadata.name;
        return { text: name, value: name };
      }),
    ];
  }, [namespaces]);

  useEffect(() => {
    if (!searchValue) return;
    initializePagination();
  }, [searchValue, initializePagination]);

  const handleClusterChange = (option: SelectSingleValue<SelectOption>) => {
    if (!option) return;
    setSelectedCluster(option);
    setSelectedNamespace({ text: '전체', value: '' });
    initializePagination();
  };

  const handleNamespaceChange = (option: SelectSingleValue<SelectOption>) => {
    if (!option) return;
    setSelectedNamespace(option);
    initializePagination();
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '인프라 관리' }, { label: '워크로드' }]}
      />
      <div className="page-title-box">
        <h2 className="page-title">워크로드</h2>
      </div>
      <div className="page-content">
        <div className="page-toolBox">
          <div className={styles.selectorRow}>
            <div className={styles.selectorField}>
              <div className={styles.selectorLabel}>클러스터 선택</div>
              <div className={styles.clusterSelect}>
                <Select
                  options={clusterOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={selectedCluster}
                  onChange={handleClusterChange}
                  placeholder="클러스터를 선택해 주세요."
                  isLoading={isClustersPending}
                />
              </div>
            </div>
            <div className={styles.selectorField}>
              <div className={styles.selectorLabel}>네임스페이스 선택</div>
              <div className={styles.namespaceSelect}>
                <Select
                  options={namespaceOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={selectedNamespace}
                  onChange={handleNamespaceChange}
                  placeholder="네임스페이스를 선택해 주세요."
                  isDisabled={!selectedCluster}
                  isLoading={isNamespacesPending}
                />
              </div>
            </div>
          </div>
          <div>
            <SearchInput
              variant="default"
              placeholder="검색어를 입력해주세요"
              value={searchInputValue}
              onChange={onSearchInputChange}
              onSearch={onSearchInputSearch}
            />
          </div>
        </div>

        <div className="h-[481px]">
          <Table
            useClientPagination
            columns={columns}
            data={allPods}
            isLoading={isPodsPending}
            globalFilter={searchValue}
            emptyMessage={
              isError ? (
                '워크로드 정보를 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>파드가 없습니다.</div>
                  <div>선택한 조건에 맞는 워크로드가 없습니다.</div>
                </div>
              )
            }
            emptySearchMessage="파드 이름과 일치하는 검색 결과가 없습니다."
            totalCount={allPods.length}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>
    </main>
  );
};

export default WorkloadPage;
