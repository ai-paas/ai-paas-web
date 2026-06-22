import { useGetClusters } from '@/hooks/service/clusters';
import {
  useMultiPromQuery,
  type MultiQuerySpec,
  type PrometheusMatrixResult,
  type PrometheusQueryResponse,
  type PrometheusVectorResult,
} from '@/hooks/service/monitoring';
import { useGetObservabilityAlerts } from '@/hooks/service/observability';
import { BreadCrumb, Select, type SelectSingleValue } from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';
import { MetricLineChart } from './metric-line-chart';
import { ResourceGaugeCard } from './resource-gauge-card';
import styles from './monitoring.module.scss';

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
  label: string;
  value: string;
};

const MonitoringPage = () => {
  const { clusters, isPending: isClustersPending } = useGetClusters();
  const clusterOptions = clusters
    .filter((cluster) => !!cluster.clusterName)
    .map((cluster) => ({
      label: cluster.clusterName ?? '',
      value: cluster.clusterName ?? '',
    }));
  const [selectedCluster, setSelectedCluster] = useState<SelectOption>();

  // 비-가속기 cluster 에서 GPU query 6개 skip.
  const selectedClusterEntity = useMemo(
    () => clusters.find((c) => c.clusterName === selectedCluster?.value),
    [clusters, selectedCluster]
  );
  const hasGpu = selectedClusterEntity?.hasGpuNodes ?? false;

  useEffect(() => {
    if (!clusters.length) {
      if (selectedCluster) {
        setSelectedCluster(undefined);
      }

      return;
    }

    const firstName = clusters[0].clusterName;
    if (
      !selectedCluster ||
      !clusters.some((cluster) => cluster.clusterName === selectedCluster.value)
    ) {
      if (firstName) {
        setSelectedCluster({ label: firstName, value: firstName });
      }
    }
  }, [clusters, selectedCluster]);

  const [windowAnchor, setWindowAnchor] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = window.setInterval(() => setWindowAnchor(Math.floor(Date.now() / 1000)), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const { start, end, step } = useMemo(() => {
    const e = windowAnchor;
    const s = e - 180 * 60;
    return { start: s, end: e, step: 300 };
  }, [windowAnchor]);

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
      instant('memoryUsage', 'sum(node_memory_MemTotal_bytes{} - node_memory_MemAvailable_bytes{})'),
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
      instant('npuTotal', 'sum(kube_node_status_capacity{resource=~".*npu.*"})'),
      instant('npuRequest', 'sum(kube_pod_container_resource_requests{resource=~".*npu.*"})'),
      instant('tpuTotal', 'gke_tpu_node_total'),
      instant('tpuAllocated', 'gke_cluster_tpu_allocated'),
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
        instant('gpuTotal', 'sum(kube_node_status_capacity{resource="nvidia_com_gpu"})'),
        instant(
          'gpuRequest',
          'sum(kube_pod_container_resource_requests{resource="nvidia_com_gpu"})'
        ),
        range('gpuUtilRange', 'DCGM_FI_DEV_GPU_UTIL'),
        range('gpuMemoryRange', 'DCGM_FI_DEV_FB_USED'),
        range('gpuTempRange', 'DCGM_FI_DEV_GPU_TEMP'),
        range('gpuPowerRange', 'DCGM_FI_DEV_POWER_USAGE')
      );
    }
    return list;
  }, [start, end, step, hasGpu]);

  const { data: results, isPending: isMetricsPending } = useMultiPromQuery(
    selectedCluster?.value,
    queries
  );

  const instantOf = <TLabel = Record<string, string>,>(
    name: string
  ): PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]> | undefined =>
    results?.[name] as
      | PrometheusQueryResponse<PrometheusVectorResult<TLabel>[]>
      | undefined;
  const rangeOf = <TLabel = Record<string, string>,>(
    name: string
  ): PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]> | undefined =>
    results?.[name] as
      | PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]>
      | undefined;
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
  const npuTotalValue = scalar('npuTotal');
  const npuRequestValue = scalar('npuRequest');
  const tpuTotalValue = scalar('tpuTotal');
  const tpuAllocatedValue = scalar('tpuAllocated');

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
  const gpuGaugeValue = Math.max(
    0,
    Math.min(gpuTotalValue ? (gpuRequestValue / gpuTotalValue) * 100 : 0, 100)
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
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '인프라 관리' }, { label: '모니터링' }]} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">모니터링</h2>
      </div>
      <div className={`page-content`}>
        <div>클러스터 선택</div>
        <Select
          options={clusterOptions}
          value={selectedCluster ?? null}
          onChange={(option: SelectSingleValue<SelectOption>) => {
            if (option) {
              setSelectedCluster(option);
            }
          }}
          placeholder="선택해 주세요."
          isLoading={isClustersPending}
        />

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
                usage={`${gpuRequestValue.toFixed(0)} / ${gpuTotalValue.toFixed(0)} GPU`}
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
                title="GPU UTILIZATION"
                unit="%"
                response={rangeOf<DCGMLabel>('gpuUtilRange')}
                isPending={hasGpu && isMetricsPending}
                domain={[0, 100]}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU MEMORY USAGE"
                unit="GiB"
                response={rangeOf<DCGMLabel>('gpuMemoryRange')}
                isPending={hasGpu && isMetricsPending}
                convertValue={(value) => value / 1024}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU TEMPERATURE"
                unit="°C"
                domain={[0, 100]}
                response={rangeOf<DCGMLabel>('gpuTempRange')}
                isPending={hasGpu && isMetricsPending}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU POWER USAGE"
                unit="W"
                response={rangeOf<DCGMLabel>('gpuPowerRange')}
                isPending={hasGpu && isMetricsPending}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
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

        {/* alerts 섹션 */}
        {selectedCluster?.value && (
          <ObservabilityAlertsSection clusterName={selectedCluster.value} />
        )}
      </div>
    </main>
  );
};

// Alerts 섹션 — 발생 중인 alert 표시
const ObservabilityAlertsSection = ({ clusterName }: { clusterName: string }) => {
  const { alerts, isPending, isError } = useGetObservabilityAlerts(clusterName);
  return (
    <div className={styles.section}>
      <h3 className="page-detail-title">발생 중인 알람 ({alerts.length})</h3>
      {isPending && <div style={{ color: '#666' }}>불러오는 중...</div>}
      {isError && (
        <div style={{ color: '#666' }}>
          알람 정보를 불러올 수 없습니다. 모니터링 애드온이 설치되어 있는지 확인해주세요.
        </div>
      )}
      {!isPending && !isError && alerts.length === 0 && (
        <div style={{ color: '#666' }}>현재 발생 중인 알람이 없습니다.</div>
      )}
      {alerts.length > 0 && (
        <ul style={{ maxHeight: 320, overflowY: 'auto', listStyle: 'none', padding: 0 }}>
          {alerts.map((alert, idx) => {
            const name = alert.labels?.alertname ?? `alert-${idx}`;
            const severity = alert.labels?.severity ?? 'unknown';
            const summary = alert.annotations?.summary ?? alert.annotations?.description ?? '';
            const variant = severity === 'critical' ? 'negative' : 'wait';
            return (
              <li
                key={`${name}-${idx}`}
                style={{
                  padding: 10,
                  marginBottom: 6,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`table-td-state table-td-state-${variant}`}>{severity}</span>
                  <strong>{name}</strong>
                  {alert.state && (
                    <span style={{ fontSize: 12, color: '#666' }}>{alert.state}</span>
                  )}
                </div>
                {summary && <div style={{ fontSize: 13, color: '#444' }}>{summary}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MonitoringPage;
