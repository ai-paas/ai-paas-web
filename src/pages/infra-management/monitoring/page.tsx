import { useGetClusters } from '@/hooks/service/clusters';
import { metricsOutage } from '@/util/prom-results';
import { ClusterPicker } from '@/components/features/infra-management/cluster-picker';
import {
  useMultiPromQuery,
  type MultiQuerySpec,
  type PrometheusMatrixResult,
  type PrometheusQueryResponse,
  type PrometheusVectorResult,
} from '@/hooks/service/monitoring';
import { BreadCrumb } from '@innogrid/ui';
import { Link } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { AcceleratorPanel } from './accelerator-panel';
import { CollectorNotice } from './collector-notice';
import { RefreshControl } from './refresh-control';
import { stepFor, TIME_RANGES } from './refresh-options';
import { MetricLineChart } from './metric-line-chart';
import styles from './monitoring.module.scss';
import { ResourceGaugeCard } from './resource-gauge-card';

type FuriosaLabel = {
  device: string;
  node: string;
};

type SelectOption = {
  label: string;
  value: string;
  isDisabled?: boolean;
  reason?: string;
};

/**
 * @param clusterName 주어지면 그 클러스터로 고정한다. 클러스터 상세가 같은 화면을
 *   스코프만 좁혀 재사용하려고 쓴다 — 복제하면 한쪽만 고치게 된다.
 */
const MonitoringPage = ({ clusterName }: { clusterName?: string } = {}) => {
  const { clusters } = useGetClusters();
  const [pickedCluster, setPickedCluster] = useState<SelectOption>();
  const embedded = !!clusterName;
  const selectedCluster: SelectOption | undefined = embedded
    ? { label: clusterName, value: clusterName }
    : pickedCluster;
  const setSelectedCluster = setPickedCluster;

  const selectedClusterEntity = useMemo(
    () => clusters.find((c) => c.clusterName === selectedCluster?.value),
    [clusters, selectedCluster]
  );

  const [rangeSeconds, setRangeSeconds] = useState<number>(TIME_RANGES[0].seconds);
  const [refreshSeconds, setRefreshSeconds] = useState(30);

  const [windowAnchor, setWindowAnchor] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    if (refreshSeconds <= 0) return;
    const id = window.setInterval(
      () => setWindowAnchor(Math.floor(Date.now() / 1000)),
      refreshSeconds * 1000
    );
    return () => window.clearInterval(id);
  }, [refreshSeconds]);
  const { start, end, step } = useMemo(() => {
    const e = windowAnchor;
    return { start: e - rangeSeconds, end: e, step: stepFor(rangeSeconds) };
  }, [windowAnchor, rangeSeconds]);

  /*
   * 쿼리 목록을 만들 때는 아직 capacity 를 모른다. 첫 응답에서 capacity 가 잡히면 그 다음
   * 렌더에 무거운 range 쿼리가 따라붙는다 — 왕복 한 번을 더 쓰는 대신 플래그가 틀려도 복구된다.
   */
  const [gpuDetected, setGpuDetected] = useState(false);
  useEffect(() => {
    setGpuDetected(false);
  }, [selectedCluster?.value]);
  const hasGpu = (selectedClusterEntity?.hasGpuNodes ?? false) || gpuDetected;

  const queries = useMemo<MultiQuerySpec[]>(() => {
    const range = (name: string, query: string): MultiQuerySpec => ({
      name,
      type: 'range',
      query,
      start,
      end,
      step,
    });
    const instant = (name: string, query: string): MultiQuerySpec => ({
      name,
      type: 'instant',
      query,
    });
    const list: MultiQuerySpec[] = [
      instant('cpuTotal', 'sum(kube_node_status_capacity{resource="cpu"})'),
      instant('cpuUsage', 'sum(rate(node_cpu_seconds_total{mode!="idle"}[1m]))'),
      instant('memoryTotal', 'sum(kube_node_status_capacity{resource="memory"})'),
      instant(
        'memoryUsage',
        'sum(node_memory_MemTotal_bytes{} - node_memory_MemAvailable_bytes{})'
      ),
      instant(
        'fileSystemTotal',
        'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})'
      ),
      instant(
        'fileSystemUsage',
        'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"} - node_filesystem_free_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})'
      ),
      instant(
        'networkIo',
        'sum(rate(node_network_receive_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m]))'
      ),
      instant(
        'networkPacket',
        'sum(rate(node_network_receive_packets_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_packets_total{device=~"eth.*|ens.*|bond.*"}[1m]))'
      ),
      /*
       * 가속기 capacity 와 수집기 유무는 플래그와 무관하게 항상 본다. hasGpuNodes 는 agent
       * heartbeat 에서 오는데 드라이버가 올라오기 전에는 false 라, 그것만 믿으면 GPU 가 붙어
       * 있는데도 영역이 통째로 사라진다.
       */
      instant('gpuTotal', 'sum(kube_node_status_capacity{resource="nvidia_com_gpu"})'),
      instant('gpuRequest', 'sum(kube_pod_container_resource_requests{resource="nvidia_com_gpu"})'),
      instant('gpuUtilAvg', 'avg(DCGM_FI_DEV_GPU_UTIL)'),
      instant('gpuCollector', 'count(DCGM_FI_DEV_GPU_UTIL) or vector(0)'),
      instant('npuCollector', 'count(furiosa_npu_hw_temperature) or vector(0)'),
      instant('npuTotal', 'sum(kube_node_status_capacity{resource=~".*npu.*"})'),
      instant('npuRequest', 'sum(kube_pod_container_resource_requests{resource=~".*npu.*"})'),
      instant('tpuTotal', 'sum(gke_tpu_node_allocatable{resource_type="tpu"})'),
      instant('tpuAllocated', 'sum(gke_cluster_tpu_allocated)'),
      range('cpuRange', 'sum(rate(node_cpu_seconds_total{mode!="idle"}[1m]))'),
      range('memoryRange', 'sum(node_memory_MemTotal_bytes{} - node_memory_MemAvailable_bytes{})'),
      range(
        'filesystemRange',
        'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"} - node_filesystem_free_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})'
      ),
      range(
        'networkIoRange',
        'sum(rate(node_network_receive_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m]))'
      ),
      range(
        'networkPacketRange',
        'sum(rate(node_network_receive_packets_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_packets_total{device=~"eth.*|ens.*|bond.*"}[1m]))'
      ),
      range('npuTempRange', 'furiosa_npu_hw_temperature{label="Average"}'),
      range('npuPowerRange', 'furiosa_npu_hw_power{label="PCI Total RMS PWR"}'),
      range('tpuTensorRange', 'gke_tpu_node_usage{resource_type="tpu"}'),
    ];
    if (hasGpu) {
      list.push(
        range('gpuUtilRange', 'DCGM_FI_DEV_GPU_UTIL'),
        range('gpuMemoryRange', 'DCGM_FI_DEV_FB_USED'),
        range('gpuTempRange', 'DCGM_FI_DEV_GPU_TEMP'),
        range('gpuPowerRange', 'DCGM_FI_DEV_POWER_USAGE'),
        range('gpuSmActiveRange', 'DCGM_FI_PROF_GR_ENGINE_ACTIVE'),
        range('gpuTensorActiveRange', 'DCGM_FI_PROF_PIPE_TENSOR_ACTIVE'),
        range('gpuDramActiveRange', 'DCGM_FI_PROF_DRAM_ACTIVE'),
        range(
          'gpuPcieRange',
          'sum by (Hostname, gpu) (rate(DCGM_FI_PROF_PCIE_TX_BYTES[1m])) + ' +
            'sum by (Hostname, gpu) (rate(DCGM_FI_PROF_PCIE_RX_BYTES[1m]))'
        )
      );
    }
    return list;
  }, [start, end, step, hasGpu]);

  const {
    data: results,
    isPending: isMetricsPending,
    isFetching: isMetricsFetching,
    dataUpdatedAt,
  } = useMultiPromQuery(selectedCluster?.value, queries, {
    // 갱신 주기보다 오래 신선하다고 보면 주기를 줄여도 화면이 그대로다.
    staleTime: refreshSeconds > 0 ? refreshSeconds * 1000 - 1_000 : Infinity,
  });

  // 쿼리가 전부 실패하면 값이 0 인 그래프가 그려진다. 고장인지 미설치인지 알 수 없다.
  const outage = metricsOutage(results);

  const instantOf = <TLabel = Record<string, string>,>(
    name: string
  ): PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]> | undefined =>
    results?.[name] as PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]> | undefined;
  const rangeOf = <TLabel = Record<string, string>,>(
    name: string
  ): PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]> | undefined =>
    results?.[name] as PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]> | undefined;
  const scalar = (name: string): number =>
    Number.parseFloat(instantOf(name)?.data?.result?.[0]?.value?.[1] ?? '0') || 0;

  const cpuTotalValue = scalar('cpuTotal');
  const cpuUsageValue = scalar('cpuUsage');
  const memoryTotalValue = scalar('memoryTotal') / 1024 ** 3;
  const memoryUsageValue = scalar('memoryUsage') / 1024 ** 3;
  const fileSystemTotalValue = scalar('fileSystemTotal') / 1024 ** 3;
  const fileSystemUsageValue = scalar('fileSystemUsage') / 1024 ** 3;
  const networkIoValue = scalar('networkIo') / 1024 ** 2;
  const networkPacketValue = scalar('networkPacket');
  const gpuTotalValue = scalar('gpuTotal');
  const gpuRequestValue = scalar('gpuRequest');
  const gpuUtilAvgValue = scalar('gpuUtilAvg');
  const gpuCollectorCount = scalar('gpuCollector');
  const npuCollectorCount = scalar('npuCollector');
  const gpuGaugeValue = Math.max(
    0,
    Math.min(gpuTotalValue ? (gpuRequestValue / gpuTotalValue) * 100 : 0, 100)
  );
  const npuTotalValue = scalar('npuTotal');
  const npuRequestValue = scalar('npuRequest');
  const tpuTotalValue = scalar('tpuTotal');
  const tpuAllocatedValue = scalar('tpuAllocated');

  useEffect(() => {
    if (gpuTotalValue > 0) setGpuDetected(true);
  }, [gpuTotalValue]);

  const cpuGaugeValue = Math.max(
    0,
    Math.min(cpuTotalValue ? (cpuUsageValue / cpuTotalValue) * 100 : 0, 100)
  );
  const memoryGaugeValue = Math.max(
    0,
    Math.min(memoryTotalValue ? (memoryUsageValue / memoryTotalValue) * 100 : 0, 100)
  );
  const fileSystemGaugeValue = Math.max(
    0,
    Math.min(fileSystemTotalValue ? (fileSystemUsageValue / fileSystemTotalValue) * 100 : 0, 100)
  );
  const npuGaugeValue = Math.max(
    0,
    Math.min(npuTotalValue ? (npuRequestValue / npuTotalValue) * 100 : 0, 100)
  );
  const tpuGaugeValue = Math.max(
    0,
    Math.min(tpuTotalValue ? (tpuAllocatedValue / tpuTotalValue) * 100 : 0, 100)
  );

  return (
    <main>
      {!embedded && (
        <>
          <div className="breadcrumbBox">
            <BreadCrumb items={[{ label: '인프라 관리' }, { label: '모니터링' }]} />
          </div>
          <div className="page-title-box">
            <h2 className="page-title">모니터링</h2>
          </div>
        </>
      )}
      <div className={`page-content`}>
        {!embedded && (
          <>
            <div>클러스터 선택</div>
            <ClusterPicker
              value={selectedCluster?.value}
              onChange={(name) => setSelectedCluster({ label: name, value: name })}
            />
          </>
        )}

        <RefreshControl
          rangeSeconds={rangeSeconds}
          onRangeChange={setRangeSeconds}
          refreshSeconds={refreshSeconds}
          onRefreshChange={setRefreshSeconds}
          updatedAt={dataUpdatedAt}
          isFetching={isMetricsFetching}
        />

        {outage && (
          <div
            role="alert"
            style={{
              marginTop: 16,
              padding: '12px 14px',
              border: '1px solid #f0d8a8',
              background: '#fdf8ed',
              borderRadius: 6,
              fontSize: 13,
              color: '#8a5a00',
            }}
          >
            <div style={{ fontWeight: 600 }}>{outage.message}</div>
            {outage.kind === 'unreachable' && (
              <div style={{ marginTop: 4 }}>
                {selectedCluster?.value ? (
                  <Link
                    to={`/infra-management/cluster-management/${encodeURIComponent(
                      selectedCluster.value
                    )}/addons`}
                    className="table-td-link"
                  >
                    애드온에서 Prometheus + Grafana Stack 설치하기 →
                  </Link>
                ) : (
                  <span>애드온에서 Prometheus + Grafana Stack 을 설치하면 지표가 채워집니다.</span>
                )}
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85, wordBreak: 'break-all' }}>
              {outage.detail}
            </div>
          </div>
        )}

        <div className="page-content-detail-col2 page-mt-16">
          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">리소스 현황</div>
            <div
              className={`page-detail-round-data page-content-detail-row2 ${styles.resourceGaugeList}`}
            >
              <ResourceGaugeCard
                name="CPU"
                gauge={cpuGaugeValue}
                value={`${cpuGaugeValue.toFixed(2)}%`}
                usage={`${cpuUsageValue.toFixed(1)} / ${cpuTotalValue.toFixed(1)} Core`}
              />
              <ResourceGaugeCard
                name="메모리"
                gauge={memoryGaugeValue}
                value={`${memoryGaugeValue.toFixed(2)}%`}
                usage={`${memoryUsageValue.toFixed(1)} / ${memoryTotalValue.toFixed(1)} GiB`}
              />
              <ResourceGaugeCard
                name="파일 시스템"
                gauge={fileSystemGaugeValue}
                value={`${fileSystemGaugeValue.toFixed(2)}%`}
                usage={`${fileSystemUsageValue.toFixed(1)} / ${fileSystemTotalValue.toFixed(1)} GiB`}
              />
              <ResourceGaugeCard
                name="네트워크 IO"
                gauge={0}
                value={`${networkIoValue.toFixed(2)} MB/s`}
                usage="RX + TX"
              />
              <ResourceGaugeCard
                name="네트워크 패킷"
                gauge={0}
                value={`${networkPacketValue.toFixed(0)} pkt/s`}
                usage="RX + TX"
              />
              <ResourceGaugeCard
                name="GPU"
                gauge={gpuGaugeValue}
                value={`${gpuGaugeValue.toFixed(2)}%`}
                usage={`${gpuRequestValue.toFixed(0)} / ${gpuTotalValue.toFixed(0)} GPU · 실사용 ${gpuUtilAvgValue.toFixed(0)}%`}
              />
              <ResourceGaugeCard
                name="NPU"
                gauge={npuGaugeValue}
                value={`${npuGaugeValue.toFixed(2)}%`}
                usage={`${npuRequestValue.toFixed(0)} / ${npuTotalValue.toFixed(0)} NPU`}
              />
              <ResourceGaugeCard
                name="TPU"
                gauge={tpuGaugeValue}
                value={`${tpuGaugeValue.toFixed(2)}%`}
                usage={`${tpuAllocatedValue.toFixed(0)} / ${tpuTotalValue.toFixed(0)} TPU`}
              />
            </div>
          </div>

          {gpuTotalValue > 0 && gpuCollectorCount === 0 && (
            <CollectorNotice
              deviceName="GPU"
              addonName="NVIDIA GPU Operator"
              clusterName={selectedCluster?.value}
            />
          )}
          {npuTotalValue > 0 && npuCollectorCount === 0 && (
            <CollectorNotice
              deviceName="NPU"
              addonName="Furiosa NPU Exporter"
              clusterName={selectedCluster?.value}
            />
          )}

          {hasGpu && (
            <AcceleratorPanel
              isPending={isMetricsPending}
              charts={{
                util: rangeOf('gpuUtilRange'),
                memory: rangeOf('gpuMemoryRange'),
                temperature: rangeOf('gpuTempRange'),
                power: rangeOf('gpuPowerRange'),
                smActive: rangeOf('gpuSmActiveRange'),
                tensorActive: rangeOf('gpuTensorActiveRange'),
                dramActive: rangeOf('gpuDramActiveRange'),
                pcie: rangeOf('gpuPcieRange'),
              }}
            />
          )}

          <div className="page-detail-round-box page-flex-1">
            <div className="page-detail-round-name">성능 지표</div>
            <div className={`page-detail-round-data ${styles.metricChartGrid}`}>
              <MetricLineChart
                title="CPU"
                unit="core"
                response={rangeOf('cpuRange')}
                isPending={isMetricsPending}
                domain={[0, cpuTotalValue]}
              />
              <MetricLineChart
                title="MEMORY"
                unit="GiB"
                response={rangeOf('memoryRange')}
                isPending={isMetricsPending}
                domain={[0, memoryTotalValue]}
                convertValue={(value) => value / 1024 ** 3}
              />
              <MetricLineChart
                title="FILESYSTEM"
                unit="GiB"
                response={rangeOf('filesystemRange')}
                isPending={isMetricsPending}
                domain={[0, fileSystemTotalValue]}
                convertValue={(value) => value / 1024 ** 3}
              />
              <MetricLineChart
                title="NETWORK IO"
                unit="MB/s"
                response={rangeOf('networkIoRange')}
                isPending={isMetricsPending}
                convertValue={(value) => value / 1024 ** 2}
              />
              <MetricLineChart
                title="NETWORK PACKET"
                unit="pkt/s"
                response={rangeOf('networkPacketRange')}
                isPending={isMetricsPending}
              />
              <MetricLineChart
                title="NPU TEMPERATURE"
                unit="°C"
                response={rangeOf<FuriosaLabel>('npuTempRange')}
                isPending={isMetricsPending}
                domain={[0, 100]}
                convertValue={(value) => value / 1000}
                makeLabel={(value) => `${value.node} ${value.device}`}
              />
              <MetricLineChart
                title="NPU POWER USAGE"
                unit="W"
                response={rangeOf<FuriosaLabel>('npuPowerRange')}
                isPending={isMetricsPending}
                convertValue={(value) => value / 1000000}
                makeLabel={(value) => `${value.node} ${value.device}`}
              />
              <MetricLineChart
                title="TPU TENSOR UTILIZATION"
                unit="%"
                response={rangeOf('tpuTensorRange')}
                isPending={isMetricsPending}
                domain={[0, 100]}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MonitoringPage;
