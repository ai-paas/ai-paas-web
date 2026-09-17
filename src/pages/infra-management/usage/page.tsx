import { ClusterPicker } from '@/components/features/infra-management/cluster-picker';
import {
  type PrometheusMatrixResult,
  type PrometheusQueryResponse,
  useRangeQuery,
} from '@/hooks/service/monitoring';
import { BreadCrumb, RadioGroupButton } from '@innogrid/ui';
import { type CSSProperties, useMemo, useState } from 'react';
import styles from './page.module.scss';
import { acceleratorEmptyReason } from '@/util/accelerator-empty';

type DCGMLabel = {
  Hostname: string;
  device: string;
  exported_namespace: string;
  exported_pod?: string;
  gpu?: string;
  modelName: string;
};

type KubernetesNpuLabel = {
  node: string;
};

type TpuLabel = {
  node?: string;
  instance?: string;
  device?: string;
  resource_type?: string;
};

type SelectOption = {
  text: string;
  value: string;
};

type RangeKey = '24h' | '7d' | '30d';

const rangeOptions: Array<{
  label: string;
  value: RangeKey;
  durationSeconds: number;
  step: number;
  bucketSeconds: number;
}> = [
  {
    label: '24시간',
    value: '24h',
    durationSeconds: 24 * 60 * 60,
    step: 60 * 60,
    bucketSeconds: 60 * 60,
  },
  {
    label: '7일',
    value: '7d',
    durationSeconds: 7 * 24 * 60 * 60,
    step: 6 * 60 * 60,
    bucketSeconds: 6 * 60 * 60,
  },
  {
    label: '30일',
    value: '30d',
    durationSeconds: 30 * 24 * 60 * 60,
    step: 24 * 60 * 60,
    bucketSeconds: 24 * 60 * 60,
  },
];

type TimeBucket = {
  label: string;
  start: number;
  end: number;
};

type SummaryCard = {
  name: string;
  value: number;
  devices: number;
};

type HeatmapRow = {
  id: string;
  label: string;
  accelerator: 'GPU' | 'NPU' | 'TPU';
  values: Array<number | null>;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const formatPercent = (value?: number) => `${Number(value ?? 0).toFixed(1)}%`;

const buildAcceleratorUsage = <TLabel,>({
  response,
  buckets,
  accelerator,
  getNodeName,
  getDeviceName,
}: {
  response?: PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]>;
  buckets: TimeBucket[];
  accelerator: HeatmapRow['accelerator'];
  getNodeName: (metric: TLabel) => string;
  getDeviceName: (metric: TLabel, index: number) => string;
}): { summary: SummaryCard; rows: HeatmapRow[] } => {
  let sampleSum = 0;
  let sampleCount = 0;

  const rows = (response?.data?.result ?? [])
    .map((metric, index) => {
      const nodeName = getNodeName(metric.metric);
      const deviceName = getDeviceName(metric.metric, index);
      const parsedSamples = metric.values
        .map(([timestamp, rawValue]) => ({
          timestamp,
          value: Number.parseFloat(rawValue),
        }))
        .filter((sample) => Number.isFinite(sample.value));

      parsedSamples.forEach(({ value }) => {
        sampleSum += value;
        sampleCount += 1;
      });

      return {
        id: `${accelerator}-${nodeName}-${deviceName}-${index}`,
        label: `${nodeName} / ${deviceName}`,
        accelerator,
        values: buckets.map((bucket, bucketIndex) => {
          const bucketSamples = parsedSamples.filter(({ timestamp }) =>
            bucketIndex === 0 || bucket.start === bucket.end
              ? timestamp >= bucket.start && timestamp <= bucket.end
              : timestamp > bucket.start && timestamp <= bucket.end
          );

          if (!bucketSamples.length) {
            return null;
          }

          return bucketSamples.reduce((sum, { value }) => sum + value, 0) / bucketSamples.length;
        }),
      };
    })
    .filter((row) => row.values.some((value) => value !== null));

  return {
    summary: {
      name: accelerator,
      value: clampPercent(sampleCount ? sampleSum / sampleCount : 0),
      devices: rows.length,
    },
    rows,
  };
};

/**
 * @param clusterName 주어지면 그 클러스터로 고정한다. 클러스터 상세가 같은 화면을
 *   스코프만 좁혀 재사용하려고 쓴다 — 복제하면 한쪽만 고치게 된다.
 */
const UsagePage = ({ clusterName }: { clusterName?: string } = {}) => {
  const [pickedCluster, setPickedCluster] = useState<SelectOption>();
  const embedded = !!clusterName;
  const selectedCluster: SelectOption | undefined = embedded
    ? { text: clusterName, value: clusterName }
    : pickedCluster;
  const setSelectedCluster = setPickedCluster;
  const [selectedRange, setSelectedRange] = useState<RangeKey>('24h');

  const rangeWindow = useMemo(() => {
    const selectedRangeOption =
      rangeOptions.find((option) => option.value === selectedRange) ?? rangeOptions[0];
    const end = Math.floor(Date.now() / 1000);

    return {
      start: end - selectedRangeOption.durationSeconds,
      end,
      step: selectedRangeOption.step,
      bucketSeconds: selectedRangeOption.bucketSeconds,
    };
  }, [selectedRange]);

  const gpuUtilRange = useRangeQuery<DCGMLabel>({
    clusterName: selectedCluster?.value,
    query: 'avg by (Hostname,device,gpu,modelName) (DCGM_FI_DEV_GPU_UTIL)',
    ...rangeWindow,
  });
  const npuCoreRange = useRangeQuery<KubernetesNpuLabel>({
    clusterName: selectedCluster?.value,
    query:
      '((sum by (node) (kube_pod_container_resource_requests{resource=~".*npu.*"}) > bool 0) * 100) or on (node) (0 * sum by (node) (kube_node_status_capacity{resource=~".*npu.*"}))',
    ...rangeWindow,
  });
  const tpuUsageRange = useRangeQuery<TpuLabel>({
    clusterName: selectedCluster?.value,
    query: 'gke_tpu_node_usage{resource_type="tpu"}',
    ...rangeWindow,
  });

  const timeBuckets = useMemo(() => {
    const bucketCount =
      Math.floor((rangeWindow.end - rangeWindow.start) / rangeWindow.bucketSeconds) + 1;

    return Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = rangeWindow.start + index * rangeWindow.bucketSeconds;
      const date = new Date(bucketStart * 1000);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return {
        label:
          selectedRange === '24h'
            ? `${String(date.getHours()).padStart(2, '0')}:00`
            : `${month}/${day}`,
        start: bucketStart,
        end: index === bucketCount - 1 ? rangeWindow.end : bucketStart + rangeWindow.bucketSeconds,
      };
    });
  }, [rangeWindow, selectedRange]);

  const acceleratorUsage = useMemo(() => {
    const gpuUsage = buildAcceleratorUsage<DCGMLabel>({
      response: gpuUtilRange.data,
      buckets: timeBuckets,
      accelerator: 'GPU',
      getNodeName: (metric) => metric.Hostname || 'unknown-node',
      getDeviceName: (metric, index) => metric.device || metric.gpu || `GPU${index}`,
    });
    const npuUsage = buildAcceleratorUsage<KubernetesNpuLabel>({
      response: npuCoreRange.data,
      buckets: timeBuckets,
      accelerator: 'NPU',
      getNodeName: (metric) => metric.node || 'unknown-node',
      getDeviceName: () => 'NPU',
    });
    const tpuUsage = buildAcceleratorUsage<TpuLabel>({
      response: tpuUsageRange.data,
      buckets: timeBuckets,
      accelerator: 'TPU',
      getNodeName: (metric) => metric.node || metric.instance || 'unknown-node',
      getDeviceName: (metric, index) => metric.device || metric.resource_type || `TPU${index}`,
    });

    return {
      summaryCards: [gpuUsage.summary, npuUsage.summary, tpuUsage.summary],
      heatmapRows: [...gpuUsage.rows, ...npuUsage.rows, ...tpuUsage.rows],
    };
  }, [gpuUtilRange.data, npuCoreRange.data, timeBuckets, tpuUsageRange.data]);
  const heatmapGridStyle = {
    '--heatmap-column-count': timeBuckets.length,
  } as CSSProperties;

  // 못 가져온 것과 없는 것은 다른 말이다. 하나로 뭉뚱그리면 Prometheus 가 없을 때도 GPU 가
  // 없는 것처럼 보여 엉뚱한 곳을 뒤지게 된다.
  const emptyReason = acceleratorEmptyReason({
    clusterSelected: !!selectedCluster?.value,
    isPending: gpuUtilRange.isPending || npuCoreRange.isPending || tpuUsageRange.isPending,
    anyFailed: gpuUtilRange.isError || npuCoreRange.isError || tpuUsageRange.isError,
    rowCount: acceleratorUsage.heatmapRows.length,
  });

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={[{ label: '인프라 관리' }, { label: 'GPU' }, { label: '사용량' }]} />
      </div>
      {!embedded && (
        <div className="page-title-box">
          <h2 className="page-title">사용량</h2>
        </div>
      )}
      <div className="page-content">
        <div className={`${styles.filterToolbar} page-mt-16`}>
          {!embedded && (
            <div className={styles.filterField}>
              <div className={styles.filterLabel}>클러스터</div>
              <div className={styles.clusterSelect}>
                <ClusterPicker
                  value={selectedCluster?.value}
                  onChange={(name) => setSelectedCluster({ text: name, value: name })}
                  requireReady={false}
                />
              </div>
            </div>
          )}

          <div className={styles.filterField}>
            <div className={styles.filterLabel}>기간</div>
            <RadioGroupButton
              id="usage-range"
              options={rangeOptions.map(({ label, value }) => ({ label, value }))}
              value={selectedRange}
              onValueChange={(value: string) => setSelectedRange(value as RangeKey)}
            />
          </div>
        </div>

        <div className="page-detail-round-box">
          <div className="page-detail-round-name">가속기 사용량</div>
          <div className={`page-detail-round-data ${styles.usageSummaryGrid}`}>
            {acceleratorUsage.summaryCards.map((card) => (
              <section key={card.name}>
                <div className={styles.summaryName}>{card.name}</div>
                <div className={styles.summaryValue}>{formatPercent(card.value)}</div>
                <div className={styles.summaryDevices}>{card.devices.toLocaleString()} Devices</div>
              </section>
            ))}
          </div>
        </div>

        <div className="page-detail-round-box">
          <div className="page-detail-round-name">가속기 사용량 히트맵</div>
          <div className="page-detail-round-data">
            <div className={styles.heatmapScroller}>
              <div className={styles.heatmapGrid} style={heatmapGridStyle}>
                <div className={styles.heatmapHeaderCell}>Node / Device</div>
                {timeBuckets.map((bucket) => (
                  <div key={`${bucket.start}-${bucket.label}`} className={styles.heatmapTimeCell}>
                    {bucket.label}
                  </div>
                ))}

                {acceleratorUsage.heatmapRows.length ? (
                  acceleratorUsage.heatmapRows.map((row) => (
                    <div key={row.id} className={styles.heatmapRow}>
                      <div className={styles.heatmapDeviceCell}>
                        <span className={styles.acceleratorBadge}>{row.accelerator}</span>
                        <span>{row.label}</span>
                      </div>
                      {row.values.map((value, index) => (
                        <div
                          key={`${row.id}-${timeBuckets[index]?.start ?? index}`}
                          className={`${styles.heatCell} ${
                            value === null ? styles.heatCellEmpty : ''
                          }`}
                          style={
                            value === null
                              ? undefined
                              : ({
                                  '--heat-level': clampPercent(value),
                                } as CSSProperties)
                          }
                          title={
                            value === null
                              ? `${row.label}: 데이터 없음`
                              : `${row.label}: ${formatPercent(value)}`
                          }
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  <div
                    className={styles.emptyState}
                    style={{ gridColumn: `1 / span ${timeBuckets.length + 1}` }}
                  >
                    {emptyReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UsagePage;
