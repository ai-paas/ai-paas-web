import { useGetClusters } from '@/hooks/service/clusters';
import {
  useInstantQuery,
  useRangeQuery,
} from '@/hooks/service/monitoring';
import { BreadCrumb, Select, type SelectSingleValue } from '@innogrid/ui';
import { useEffect, useState } from 'react';
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
  const clusterOptions = clusters.map((cluster) => ({ label: cluster.id, value: cluster.id }));
  const [selectedCluster, setSelectedCluster] = useState<SelectOption>();

  useEffect(() => {
    if (!clusters.length) {
      if (selectedCluster) {
        setSelectedCluster(undefined);
      }

      return;
    }

    if (!selectedCluster || !clusters.some((cluster) => cluster.id === selectedCluster.value)) {
      setSelectedCluster({ label: clusters[0].id, value: clusters[0].id });
    }
  }, [clusters, selectedCluster]);

  const { data: cpuTotal } = useInstantQuery(
    'sum(kube_node_status_capacity{resource="cpu"})',
    selectedCluster?.value
  );
  const { data: cpuUsage } = useInstantQuery(
    'sum(rate(node_cpu_seconds_total{mode!="idle"}[1m]))',
    selectedCluster?.value
  );
  const { data: memoryTotal } = useInstantQuery(
    'sum(kube_node_status_capacity{resource="memory"})',
    selectedCluster?.value
  );
  const { data: memoryUsage } = useInstantQuery(
    'sum(node_memory_MemTotal_bytes{} - node_memory_MemAvailable_bytes{})',
    selectedCluster?.value
  );
  const { data: fileSystemTotal } = useInstantQuery(
    'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})',
    selectedCluster?.value
  );
  const { data: fileSystemUsage } = useInstantQuery(
    'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"} - node_filesystem_free_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})',
    selectedCluster?.value
  );
  const { data: networkIo } = useInstantQuery(
    'sum(rate(node_network_receive_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m]))',
    selectedCluster?.value
  );
  const { data: networkPacket } = useInstantQuery(
    'sum(rate(node_network_receive_packets_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_packets_total{device=~"eth.*|ens.*|bond.*"}[1m]))',
    selectedCluster?.value
  );
  const { data: gpuTotal } = useInstantQuery(
    'sum(kube_node_status_capacity{resource="nvidia_com_gpu"})',
    selectedCluster?.value
  );
  const { data: gpuRequest } = useInstantQuery(
    'sum(kube_pod_container_resource_requests{resource="nvidia_com_gpu"})',
    selectedCluster?.value
  );
  const { data: npuTotal } = useInstantQuery(
    'sum(kube_node_status_capacity{resource=~".*npu.*"})',
    selectedCluster?.value
  );
  const { data: npuRequest } = useInstantQuery(
    'sum(kube_pod_container_resource_requests{resource=~".*npu.*"})',
    selectedCluster?.value
  );
  const { data: tpuTotal } = useInstantQuery('gke_tpu_node_total', selectedCluster?.value);
  const { data: tpuAllocated } = useInstantQuery(
    'gke_cluster_tpu_allocated',
    selectedCluster?.value
  );

  const end = Math.floor(Date.now() / 1000);
  const start = end - 180 * 60;
  const step = 300;

  const cpuRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query: 'sum(rate(node_cpu_seconds_total{mode!="idle"}[1m]))',
    start,
    end,
    step,
  });
  const memoryRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query: 'sum(node_memory_MemTotal_bytes{} - node_memory_MemAvailable_bytes{})',
    start,
    end,
    step,
  });
  const filesystemRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query:
      'sum(node_filesystem_size_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"} - node_filesystem_free_bytes{fstype=~"ext4|xfs|btrfs", mountpoint="/"})',
    start,
    end,
    step,
  });
  const networkIoRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query:
      'sum(rate(node_network_receive_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_bytes_total{device=~"eth.*|ens.*|bond.*"}[1m]))',
    start,
    end,
    step,
  });
  const networkPacketRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query:
      'sum(rate(node_network_receive_packets_total{device=~"eth.*|ens.*|bond.*"}[1m])) + sum(rate(node_network_transmit_packets_total{device=~"eth.*|ens.*|bond.*"}[1m]))',
    start,
    end,
    step,
  });
  const gpuUtilRange = useRangeQuery<DCGMLabel>({
    clusterName: selectedCluster?.value,
    query: 'DCGM_FI_DEV_GPU_UTIL',
    start,
    end,
    step,
  });
  const gpuMemoryRange = useRangeQuery<DCGMLabel>({
    clusterName: selectedCluster?.value,
    query: 'DCGM_FI_DEV_FB_USED',
    start,
    end,
    step,
  });
  const gpuTempRange = useRangeQuery<DCGMLabel>({
    clusterName: selectedCluster?.value,
    query: 'DCGM_FI_DEV_GPU_TEMP',
    start,
    end,
    step,
  });
  const gpuPowerRange = useRangeQuery<DCGMLabel>({
    clusterName: selectedCluster?.value,
    query: 'DCGM_FI_DEV_POWER_USAGE',
    start,
    end,
    step,
  });
  const npuTempRange = useRangeQuery<FuriosaLabel>({
    clusterName: selectedCluster?.value,
    query: 'furiosa_npu_hw_temperature{label="Average"}',
    start,
    end,
    step,
  });
  const npuPowerRange = useRangeQuery<FuriosaLabel>({
    clusterName: selectedCluster?.value,
    query: 'furiosa_npu_hw_power{label="PCI Total RMS PWR"}',
    start,
    end,
    step,
  });
  const tpuTensorRange = useRangeQuery({
    clusterName: selectedCluster?.value,
    query: 'gke_tpu_node_usage{resource_type="tpu"}',
    start,
    end,
    step,
  });

  const cpuTotalValue = Number.parseFloat(cpuTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const cpuUsageValue = Number.parseFloat(cpuUsage?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const memoryTotalValue =
    (Number.parseFloat(memoryTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0) / 1024 ** 3;
  const memoryUsageValue =
    (Number.parseFloat(memoryUsage?.data?.result?.[0]?.value?.[1] ?? '0') || 0) / 1024 ** 3;
  const fileSystemTotalValue =
    (Number.parseFloat(fileSystemTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0) / 1024 ** 3;
  const fileSystemUsageValue =
    (Number.parseFloat(fileSystemUsage?.data?.result?.[0]?.value?.[1] ?? '0') || 0) / 1024 ** 3;
  const networkIoValue =
    (Number.parseFloat(networkIo?.data?.result?.[0]?.value?.[1] ?? '0') || 0) / 1024 ** 2;
  const networkPacketValue =
    Number.parseFloat(networkPacket?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const gpuTotalValue = Number.parseFloat(gpuTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const gpuRequestValue = Number.parseFloat(gpuRequest?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const npuTotalValue = Number.parseFloat(npuTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const npuRequestValue = Number.parseFloat(npuRequest?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const tpuTotalValue = Number.parseFloat(tpuTotal?.data?.result?.[0]?.value?.[1] ?? '0') || 0;
  const tpuAllocatedValue =
    Number.parseFloat(tpuAllocated?.data?.result?.[0]?.value?.[1] ?? '0') || 0;

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
      <BreadCrumb
        items={[{ label: '인프라 관리' }, { label: '모니터링' }]}
      />
      <div className="page-title-box">
        <h2 className="page-title">모니터링</h2>
      </div>
      <div className={`page-content`}>
        <div>클러스터 선택</div>
        <Select
          options={clusterOptions}
          value={selectedCluster}
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
                response={cpuRange.data}
                domain={[0, cpuTotalValue]}
              />
              <MetricLineChart
                title="MEMORY"
                unit="GiB"
                response={memoryRange.data}
                domain={[0, memoryTotalValue]}
                convertValue={(value) => value / 1024 ** 3}
              />
              <MetricLineChart
                title="FILESYSTEM"
                unit="GiB"
                response={filesystemRange.data}
                domain={[0, fileSystemTotalValue]}
                convertValue={(value) => value / 1024 ** 3}
              />
              <MetricLineChart
                title="NETWORK IO"
                unit="MB/s"
                response={networkIoRange.data}
                convertValue={(value) => value / 1024 ** 2}
              />
              <MetricLineChart title="NETWORK PACKET" unit="pkt/s" response={networkPacketRange.data} />
              <MetricLineChart
                title="GPU UTILIZATION"
                unit="%"
                response={gpuUtilRange.data}
                domain={[0, 100]}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU MEMORY USAGE"
                unit="GiB"
                response={gpuMemoryRange.data}
                convertValue={(value) => value / 1024}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU TEMPERATURE"
                unit="°C"
                domain={[0, 100]}
                response={gpuTempRange.data}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="GPU POWER USAGE"
                unit="W"
                response={gpuPowerRange.data}
                makeLabel={(value) => `${value.Hostname} ${value.device}`}
              />
              <MetricLineChart
                title="NPU TEMPERATURE"
                unit="°C"
                response={npuTempRange.data}
                domain={[0, 100]}
                convertValue={(value) => value / 1000}
                makeLabel={(value) => `${value.node} ${value.device}`}
              />
              <MetricLineChart
                title="NPU POWER USAGE"
                unit="W"
                response={npuPowerRange.data}
                convertValue={(value) => value / 1000000}
                makeLabel={(value) => `${value.node} ${value.device}`}
              />
              <MetricLineChart
                title="TPU TENSOR UTILIZATION"
                unit="%"
                response={tpuTensorRange.data}
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
