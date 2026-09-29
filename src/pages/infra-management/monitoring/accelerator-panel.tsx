import type {
  PrometheusMatrixResult,
  PrometheusQueryResponse,
} from '@/hooks/service/monitoring';

import styles from './accelerator-panel.module.scss';
import { MetricLineChart } from './metric-line-chart';

/** DCGM 이 붙이는 라벨. gpu 는 장 번호, device 는 nvidia0 같은 장치명이다. */
type DcgmLabels = {
  Hostname?: string;
  device?: string;
  gpu?: string;
  modelName?: string;
};

type RangeResponse = PrometheusQueryResponse<PrometheusMatrixResult<DcgmLabels>[]> | undefined;

export type AcceleratorPanelProps = {
  isPending: boolean;
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

const deviceLabel = (metric: DcgmLabels): string =>
  `${metric.Hostname ?? '-'} ${metric.gpu ?? metric.device ?? ''}`.trim();

/**
 * 장치 목록과 점유 파드는 가속기 페이지가 맡는다 — 여기는 시간에 따른 변화만 본다.
 *
 * <p>한 화면에 같은 표가 두 번 나오면 어느 쪽이 정본인지 알 수 없다.
 */
export const AcceleratorPanel = ({ isPending, charts }: AcceleratorPanelProps) => {
  return (
    <div className="page-detail-round-box page-flex-1">
      <div className="page-detail-round-name">가속기 (GPU)</div>
      <div className="page-detail-round-data">
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
