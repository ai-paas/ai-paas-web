import { useGetClusters, useGetKubernetesNodes } from '@/hooks/service/clusters';
import { useInstantQuery } from '@/hooks/service/monitoring';
import {
  BreadCrumb,
  ExpandCellButton,
  Select,
  Table,
  useTablePagination,
  type ColDef,
  type TableRow,
} from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';
import styles from '../inframonitor.module.scss';

type DCGMLabel = {
  Hostname: string;
  device: string;
  exported_namespace: string;
  exported_pod?: string;
  gpu?: string;
  modelName: string;
};

type FuriosaLabel = {
  device: string;
  node: string;
};

type SelectOption = {
  text: string;
  value: string;
};

type AcceleratorNode = {
  nodeStatus: 'Ready' | 'Not Ready';
  os?: string;
  role: 'control-plane' | 'master' | 'worker';
  createdAt: string;
  devices: AcceleratorDeviceRow[];
};

type AcceleratorDeviceRow = {
  acceleratorType: 'GPU' | 'NPU' | 'TPU';
  modelName: string;
  deviceName: string;
  usedBy?: string;
  temperature?: number;
  power?: number;
};

type AcceleratorTableRow = {
  nodeName: string;
  nodeStatus: AcceleratorNode['nodeStatus'];
  acceleratorCount: number;
  os?: string;
  role: AcceleratorNode['role'];
  createdAt: string;
  devices: AcceleratorDeviceRow[];
};

function AcceleratorPage() {
  const { clusters, isPending: isClustersPending } = useGetClusters();
  const { pagination, setPagination } = useTablePagination();

  const clusterOptions = useMemo<SelectOption[]>(
    () =>
      clusters.map((cluster) => ({
        text: cluster.id,
        value: cluster.id,
      })),
    [clusters]
  );
  const [selectedCluster, setSelectedCluster] = useState<SelectOption>();
  const selectedClusterName = selectedCluster?.value;

  useEffect(() => {
    if (!clusterOptions.length) {
      if (selectedCluster) {
        setSelectedCluster(undefined);
      }

      return;
    }

    if (selectedCluster && clusterOptions.some((option) => option.value === selectedCluster.value))
      return;
    setSelectedCluster(clusterOptions[0]);
  }, [clusterOptions, selectedCluster]);

  const {
    nodes,
    isPending: isNodesPending,
    isError: isNodesError,
  } = useGetKubernetesNodes(selectedClusterName);

  const { data: gpuTempQueryResult, isPending: isGpuTempPending } = useInstantQuery<DCGMLabel>(
    'DCGM_FI_DEV_GPU_TEMP',
    selectedClusterName
  );
  const { data: gpuPowerQueryResult, isPending: isGpuPowerPending } = useInstantQuery<DCGMLabel>(
    'DCGM_FI_DEV_POWER_USAGE',
    selectedClusterName
  );
  // const { data: tpuUtilQueryResult } = useInstantQuery<PrometheusVectorResult<DCGMLabel>[]>(
  //   'stackdriver_tpu_worker_tpu_googleapis_com_cpu_utilization',
  //   selectedCluster?.value
  // );
  const { data: npuUtilMetrics, isPending: isNpuTempPending } = useInstantQuery<FuriosaLabel>(
    'furiosa_npu_hw_temperature{label="Average"}',
    selectedClusterName
  );
  const { data: npuPowerMetrics, isPending: isNpuPowerPending } = useInstantQuery<FuriosaLabel>(
    'furiosa_npu_hw_power{label="PCI Total RMS PWR"}',
    selectedClusterName
  );

  const acceleratorNodes = useMemo(() => {
    if (!selectedClusterName) return [];

    const nodeMap = new Map<string, AcceleratorNode>();
    const filteredNodes = nodes.filter((node) => {
      const keys = Object.keys(node.status.capacity ?? {});

      return keys.some((key) => key.includes('gpu') || key.includes('npu') || key.includes('tpu'));
    });

    filteredNodes.forEach((node) => {
      const nodeStatus =
        node.status.conditions?.find((condition) => condition.type === 'Ready')?.status === 'True'
          ? 'Ready'
          : 'Not Ready';
      const os = node.status.nodeInfo?.osImage;
      const role = node.metadata.labels?.['node-role.kubernetes.io/control-plane']
        ? 'control-plane'
        : node.metadata.labels?.['node-role.kubernetes.io/master']
          ? 'master'
          : 'worker';

      nodeMap.set(node.metadata.name, {
        nodeStatus,
        os,
        role,
        createdAt: node.metadata.creationTimestamp,
        devices: [],
      });
    });

    gpuTempQueryResult?.data.result.forEach(({ metric, value }) => {
      nodeMap.get(metric.Hostname)?.devices.push({
        acceleratorType: 'GPU',
        modelName: metric.modelName,
        deviceName: metric.device,
        usedBy: metric.exported_pod,
        temperature: Number(value[1]),
      });
    });

    gpuPowerQueryResult?.data.result.forEach(({ metric, value }) => {
      const node = nodeMap.get(metric.Hostname);
      const device = node?.devices.find(
        (device) => device.acceleratorType === 'GPU' && device.deviceName === metric.device
      );
      const power = Number(value[1]);

      if (device) {
        device.power = power;
        return;
      }

      node?.devices.push({
        acceleratorType: 'GPU',
        modelName: metric.modelName,
        deviceName: metric.device,
        usedBy: metric.exported_pod,
        power,
      });
    });

    npuUtilMetrics?.data.result.forEach(({ metric, value }) => {
      nodeMap.get(metric.node)?.devices.push({
        acceleratorType: 'NPU',
        modelName: 'Furiosa Warboy',
        deviceName: metric.device,
        temperature: Number(value[1]) / 1000,
      });
    });

    npuPowerMetrics?.data.result.forEach(({ metric, value }) => {
      const node = nodeMap.get(metric.node);
      const device = node?.devices.find(
        (device) => device.acceleratorType === 'NPU' && device.deviceName === metric.device
      );
      const power = Number(value[1]) / 1000000;

      if (device) {
        device.power = power;
        return;
      }

      node?.devices.push({
        acceleratorType: 'NPU',
        modelName: 'Furiosa Warboy',
        deviceName: metric.device,
        power,
      });
    });

    return Array.from(nodeMap.entries());
  }, [
    gpuPowerQueryResult,
    gpuTempQueryResult,
    nodes,
    npuPowerMetrics,
    npuUtilMetrics,
    selectedClusterName,
  ]);

  const rows = useMemo<AcceleratorTableRow[]>(
    () =>
      acceleratorNodes.map(([nodeName, node]) => ({
        nodeName,
        nodeStatus: node.nodeStatus,
        acceleratorCount: node.devices.length,
        os: node.os,
        role: node.role,
        createdAt: node.createdAt,
        devices: node.devices,
      })),
    [acceleratorNodes]
  );

  const columns = useMemo<ColDef<AcceleratorTableRow>[]>(
    () => [
      {
        id: 'expand',
        header: '',
        size: 48,
        cell: ({ row }: { row: TableRow<AcceleratorTableRow> }) => <ExpandCellButton row={row} />,
        enableSorting: false,
      },
      {
        id: 'nodeStatus',
        header: '노드 상태',
        accessorFn: (row: AcceleratorTableRow) => row.nodeStatus,
        size: 140,
        cell: ({ row }: { row: { original: AcceleratorTableRow } }) => (
          <span
            className={`table-td-state table-td-state-${
              row.original.nodeStatus === 'Ready' ? 'run' : 'negative'
            }`}
          >
            {row.original.nodeStatus}
          </span>
        ),
      },
      {
        id: 'nodeName',
        header: '노드 이름',
        accessorFn: (row: AcceleratorTableRow) => row.nodeName,
        size: 220,
      },
      {
        id: 'acceleratorCount',
        header: '가속기 개수',
        accessorFn: (row: AcceleratorTableRow) => row.acceleratorCount,
        size: 120,
      },
      {
        id: 'os',
        header: 'OS',
        accessorFn: (row: AcceleratorTableRow) => row.os ?? '-',
        size: 260,
      },
      {
        id: 'role',
        header: '역할',
        accessorFn: (row: AcceleratorTableRow) => row.role,
        size: 150,
      },
      {
        id: 'createdAt',
        header: '생성일시',
        accessorFn: (row: AcceleratorTableRow) => row.createdAt,
        size: 220,
      },
    ],
    []
  );

  const isLoading =
    !!selectedClusterName &&
    (isNodesPending ||
      isGpuTempPending ||
      isGpuPowerPending ||
      isNpuTempPending ||
      isNpuPowerPending);

  return (
    <main>
      <BreadCrumb
        items={[{ label: '인프라 관리' }, { label: '가속기' }]}
      />
      <div className="page-title-box">
        <h2 className="page-title">가속기</h2>
      </div>
      <div className="page-content">
        <div className={styles.workloadFilters}>
          <div className={styles.selectorField}>
            <div className={styles.selectorLabel}>클러스터 선택</div>
            <div className={styles.clusterSelect}>
              <Select
                options={clusterOptions}
                getOptionLabel={(option) => option.text}
                getOptionValue={(option) => option.value}
                value={selectedCluster}
                onChange={(newValue) => setSelectedCluster(newValue ?? undefined)}
                placeholder="클러스터를 선택해 주세요."
                isLoading={isClustersPending}
              />
            </div>
          </div>
        </div>

        <div className="h-[481px]">
          <Table<AcceleratorTableRow>
            useClientPagination
            useExpand
            useSelect={false}
            useSearch={false}
            columns={columns}
            data={rows}
            isLoading={isLoading}
            initialState={{ expanded: true }}
            getRowCanExpand={(row: TableRow<AcceleratorTableRow>) =>
              row.original.devices.length > 0
            }
            renderSubComponent={(row: TableRow<AcceleratorTableRow>) => (
              <div className={styles.deviceList}>
                <div className={styles.deviceListHeader}>
                  <div>가속기</div>
                  <div>모델명</div>
                  <div>디바이스명</div>
                  <div>사용 파드</div>
                  <div>온도</div>
                  <div>전력</div>
                </div>
                {row.original.devices.map((device: AcceleratorDeviceRow, index: number) => {
                  const temperatureWidth = Number.isFinite(device.temperature)
                    ? Math.min(Math.max(device.temperature ?? 0, 0), 100)
                    : 0;
                  const powerWidth = Number.isFinite(device.power)
                    ? Math.min(Math.max(((device.power ?? 0) / 400) * 100, 0), 100)
                    : 0;

                  return (
                    <div
                      className={styles.deviceListRow}
                      key={`${device.acceleratorType}-${device.deviceName}-${index}`}
                    >
                      <div>
                        <span className={styles.acceleratorBadge}>{device.acceleratorType}</span>
                      </div>
                      <div>{device.modelName}</div>
                      <div>{device.deviceName}</div>
                      <div>{device.usedBy ?? '-'}</div>
                      <div>
                        <div className={styles.deviceMetricCell}>
                          <div
                            className={styles.utilBar}
                            title={
                              device.temperature === undefined
                                ? undefined
                                : `${device.temperature.toFixed(0)}°C`
                            }
                          >
                            <div
                              className={styles.utilBarFill}
                              style={{ width: `${temperatureWidth}%` }}
                            />
                            <span className={styles.utilBarLabel}>
                              {device.temperature === undefined
                                ? '-'
                                : `${device.temperature.toFixed(0)}°C`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className={styles.deviceMetricCell}>
                          <div
                            className={styles.utilBar}
                            title={
                              device.power === undefined ? undefined : `${device.power.toFixed(1)}W`
                            }
                          >
                            <div
                              className={styles.utilBarFill}
                              style={{ width: `${powerWidth}%` }}
                            />
                            <span className={styles.utilBarLabel}>
                              {device.power === undefined ? '-' : `${device.power.toFixed(1)}W`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            emptyMessage={
              isNodesError ? (
                '가속기 정보를 불러오는 데 실패했습니다.'
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div>가속기가 없습니다.</div>
                  <div>선택한 클러스터에서 가속기 장치를 찾지 못했습니다.</div>
                </div>
              )
            }
            totalCount={rows.length}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>
    </main>
  );
}

export default AcceleratorPage;
