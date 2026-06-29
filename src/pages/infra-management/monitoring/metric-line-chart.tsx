import {
  type PrometheusMatrixResult,
  type PrometheusQueryResponse,
} from '@/hooks/service/monitoring';
import { UplotLineChart } from '@innogrid/ui';
import { memo } from 'react';
import styles from './metric-line-chart.module.scss';

type MetricLineChartProps<TLabel = Record<string, string>> = {
  title: string;
  unit: string;
  response?: PrometheusQueryResponse<PrometheusMatrixResult<TLabel>[]>;
  /** 첫 응답 도착 전 — "데이터 없음" 과 분리해 사용자에게 로딩 중임을 명시. */
  isPending?: boolean;
  domain?: [number, number];
  convertValue?: (value: number) => number;
  makeLabel?: (metric: TLabel) => string;
};

const MetricLineChartComponent = <TLabel = Record<string, string>,>({
  title,
  unit,
  response,
  isPending,
  domain,
  convertValue,
  makeLabel,
}: MetricLineChartProps<TLabel>) => {
  const rawMetrics = response?.data?.result ?? [];
  const series = rawMetrics
    .map((metric, index) => {
      const timestamps: number[] = [];
      const values: number[] = [];

      metric.values.forEach(([timestamp, rawValue]) => {
        const parsedValue = Number.parseFloat(rawValue);

        timestamps.push(timestamp);
        values.push(convertValue ? convertValue(parsedValue) : parsedValue);
      });

      return {
        label: makeLabel?.(metric.metric) ?? `${title} ${index + 1}`,
        values: [timestamps, values],
      };
    })
    .filter((item) => item.values[0].length && item.values[1].length);
  const latestValues = series
    .map((item) => item.values[1][item.values[1].length - 1])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const latestValue = !latestValues.length
    ? null
    : latestValues.reduce((sum, value) => sum + value, 0) / latestValues.length;

  return (
    <div className={`page-detail-round-box page-detail-round-color page-mt-0 ${styles.metricCard}`}>
      <div className="page-detail-round-name">
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricValue}>{`${latestValue?.toFixed(2) ?? '-'} ${unit}`}</div>
      </div>
      <div className={`page-detail-round-data ${styles.metricChartBody}`}>
        {!series.length ? (
          <div className={styles.metricEmptyState}>
            {isPending && !response ? '불러오는 중...' : '데이터가 없습니다.'}
          </div>
        ) : (
          <UplotLineChart
            className={styles.monitoringLineChart}
            data={series}
            width={390}
            height={240}
            connectNulls
            seriesOptions={{ labelKey: 'label' }}
            yAxis={domain ? { domain } : undefined}
            options={{
              legend: {
                show: false,
              },
              axes: [
                {
                  scale: 'x',
                  border: { show: true, width: 1 },
                  grid: { show: false },
                  size: 50,
                  space: 30,
                  values: (_uplot: unknown, values: (string | number)[]) =>
                    values.map((value) => {
                      const date = new Date(Number(value) * 1000);
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');

                      return `${month}/${day}\n${hours}:${minutes}`;
                    }),
                },
                {
                  scale: 'y',
                  border: { show: true, width: 1 },
                  grid: { width: 1, dash: [4, 4] },
                },
              ],
            }}
            tooltip={{
              className: styles.metricTooltip,
              content: (payload) => {
                const activePoint = payload[0];

                if (!activePoint) {
                  return <div className={styles.metricTooltipEmpty}>데이터가 없습니다.</div>;
                }

                return (
                  <div className={styles.metricTooltipContent}>
                    <div className={styles.metricTooltipTimestamp}>
                      {new Date(Number(activePoint.xValue) * 1000).toLocaleString('ko-KR')}
                    </div>
                    <div className={styles.metricTooltipList}>
                      {payload.map((item) => (
                        <div key={`${title}-${item.dataKey}`} className={styles.metricTooltipRow}>
                          <div className={styles.metricTooltipLabel}>
                            <span
                              className={styles.metricTooltipDot}
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{String(item.dataKey ?? '-')}</span>
                          </div>
                          <div className={styles.metricTooltipValue}>
                            {typeof item.value === 'number' && Number.isFinite(item.value)
                              ? `${item.value.toFixed(2)} ${unit}`
                              : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export const MetricLineChart = memo(MetricLineChartComponent) as typeof MetricLineChartComponent;
