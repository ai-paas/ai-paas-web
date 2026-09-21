import type {
  PrometheusMatrixResult,
  PrometheusQueryResponse,
} from '@/hooks/service/monitoring';
import type { DcgmLabels, GpuDevice, GpuPod } from '@/util/gpu-metrics';
import { IDLE_UTIL_THRESHOLD } from '@/util/gpu-metrics';

import styles from './accelerator-panel.module.scss';
import { MetricLineChart } from './metric-line-chart';

type RangeResponse = PrometheusQueryResponse<PrometheusMatrixResult<DcgmLabels>[]> | undefined;

export type AcceleratorPanelProps = {
  isPending: boolean;
  totalGpu: number;
  allocatedGpu: number;
  devices: GpuDevice[];
  pods: GpuPod[];
  xidCount: number;
  throttledCount: number;
  eccErrorCount: number;
  charts: {
    util: RangeResponse;
    memory: RangeResponse;
    temperature: RangeResponse;
    power: RangeResponse;
    smActive: RangeResponse;
    tensorActive: RangeResponse;
    dramActive: RangeResponse;
    pcie: RangeResponse;
  };
};

const percent = (part: number, whole: number): number =>
  whole > 0 ? Math.max(0, Math.min((part / whole) * 100, 100)) : 0;

const average = (values: number[]): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const deviceLabel = (metric: DcgmLabels): string =>
  `${metric.Hostname ?? '-'} ${metric.gpu ?? metric.device ?? ''}`.trim();

/**
 * GPU 는 "몇 장이 잡혔나" 와 "그 장이 일하고 있나" 가 다르다.
 *
 * <p>할당률만 보면 8 장을 모두 잡아 둔 채 아무것도 돌리지 않는 클러스터가 100% 로 읽힌다.
 * 두 숫자를 나란히 두는 것이 이 패널의 이유다.
 */
export const AcceleratorPanel = ({
  isPending,
  totalGpu,
  allocatedGpu,
  devices,
  pods,
  xidCount,
  throttledCount,
  eccErrorCount,
  charts,
}: AcceleratorPanelProps) => {
  const allocationRate = percent(allocatedGpu, totalGpu);
  const utilAverage = average(devices.map((device) => device.util));
  const idleCount = devices.filter((device) => device.util < IDLE_UTIL_THRESHOLD).length;
  const memUsed = devices.reduce((sum, device) => sum + device.memUsedMib, 0);
  const memTotal = devices.reduce((sum, device) => sum + device.memTotalMib, 0);
  const faultTotal = xidCount + eccErrorCount;

  return (
    <div className="page-detail-round-box page-flex-1">
      <div className="page-detail-round-name">가속기 (GPU)</div>
      <div className="page-detail-round-data">
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>할당</div>
            <div className={styles.summaryValue}>{allocationRate.toFixed(0)}%</div>
            <div className={styles.summaryHint}>
              {allocatedGpu.toFixed(0)} / {totalGpu.toFixed(0)} GPU
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>실사용</div>
            <div className={styles.summaryValue}>{utilAverage.toFixed(0)}%</div>
            <div className={styles.summaryHint}>{devices.length}장 평균</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>유휴</div>
            <div
              className={`${styles.summaryValue} ${idleCount > 0 ? styles.summaryWarn : ''}`}
              data-testid="gpu-idle-count"
            >
              {idleCount}장
            </div>
            <div className={styles.summaryHint}>사용률 {IDLE_UTIL_THRESHOLD}% 미만</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>GPU 메모리</div>
            <div className={styles.summaryValue}>{percent(memUsed, memTotal).toFixed(0)}%</div>
            <div className={styles.summaryHint}>
              {(memUsed / 1024).toFixed(1)} / {(memTotal / 1024).toFixed(1)} GiB
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>하드웨어 오류</div>
            <div
              className={`${styles.summaryValue} ${faultTotal > 0 ? styles.summaryDanger : ''}`}
              data-testid="gpu-fault-count"
            >
              {faultTotal}건
            </div>
            <div className={styles.summaryHint}>
              XID {xidCount} · ECC {eccErrorCount}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>스로틀</div>
            <div
              className={`${styles.summaryValue} ${throttledCount > 0 ? styles.summaryWarn : ''}`}
            >
              {throttledCount}장
            </div>
            <div className={styles.summaryHint}>발열, 전력 제한</div>
          </div>
        </div>

        <div className={styles.tableTitle}>장치별 현황</div>
        <div className={styles.tableWrap}>
          {devices.length === 0 ? (
            <div className={styles.empty}>
              {isPending ? '불러오는 중입니다.' : '수집된 GPU 장치가 없습니다.'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>노드</th>
                  <th>장치</th>
                  <th>모델</th>
                  <th>사용률</th>
                  <th>메모리</th>
                  <th>온도</th>
                  <th>전력</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.key} data-testid={`gpu-device-${device.key}`}>
                    <td>{device.node}</td>
                    <td>{device.device}</td>
                    <td>{device.model}</td>
                    <td className={device.util < IDLE_UTIL_THRESHOLD ? styles.summaryWarn : ''}>
                      {device.util.toFixed(0)}%
                    </td>
                    <td>
                      {(device.memUsedMib / 1024).toFixed(1)} /{' '}
                      {(device.memTotalMib / 1024).toFixed(1)} GiB
                    </td>
                    <td>{device.tempC.toFixed(0)}°C</td>
                    <td>{device.powerW.toFixed(0)}W</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.tableTitle}>GPU 점유 파드</div>
        <div className={styles.tableWrap}>
          {pods.length === 0 ? (
            <div className={styles.empty}>GPU 를 요청한 파드가 없습니다.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>네임스페이스</th>
                  <th>파드</th>
                  <th>노드</th>
                  <th>GPU</th>
                </tr>
              </thead>
              <tbody>
                {pods.map((pod) => (
                  <tr key={pod.key}>
                    <td>{pod.namespace}</td>
                    <td>{pod.pod}</td>
                    <td>{pod.node}</td>
                    <td>{pod.count.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.chartGrid}>
          <MetricLineChart
            title="GPU UTILIZATION"
            unit="%"
            response={charts.util}
            isPending={isPending}
            domain={[0, 100]}
            makeLabel={deviceLabel}
          />
          {/* SM 점유율 — UTILIZATION 은 커널이 떠 있으면 100% 다. 실제로 얼마나 채웠는지는 이쪽이다. */}
          <MetricLineChart
            title="SM ACTIVE"
            unit="%"
            response={charts.smActive}
            isPending={isPending}
            domain={[0, 100]}
            convertValue={(value) => value * 100}
            makeLabel={deviceLabel}
          />
          {/* 텐서코어 사용률. 학습인데 낮으면 FP32 경로로 돌고 있을 수 있다. */}
          <MetricLineChart
            title="TENSOR CORE ACTIVE"
            unit="%"
            response={charts.tensorActive}
            isPending={isPending}
            domain={[0, 100]}
            convertValue={(value) => value * 100}
            makeLabel={deviceLabel}
          />
          <MetricLineChart
            title="MEMORY BANDWIDTH ACTIVE"
            unit="%"
            response={charts.dramActive}
            isPending={isPending}
            domain={[0, 100]}
            convertValue={(value) => value * 100}
            makeLabel={deviceLabel}
          />
          <MetricLineChart
            title="GPU MEMORY USAGE"
            unit="GiB"
            response={charts.memory}
            isPending={isPending}
            convertValue={(value) => value / 1024}
            makeLabel={deviceLabel}
          />
          <MetricLineChart
            title="PCIE THROUGHPUT"
            unit="MB/s"
            response={charts.pcie}
            isPending={isPending}
            convertValue={(value) => value / 1024 ** 2}
            makeLabel={deviceLabel}
          />
          <MetricLineChart
            title="GPU TEMPERATURE"
            unit="°C"
            response={charts.temperature}
            isPending={isPending}
            domain={[0, 100]}
            makeLabel={deviceLabel}
          />
          <MetricLineChart
            title="GPU POWER USAGE"
            unit="W"
            response={charts.power}
            isPending={isPending}
            makeLabel={deviceLabel}
          />
        </div>
      </div>
    </div>
  );
};
