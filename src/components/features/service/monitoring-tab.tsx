import { Select, type SelectSingleValue } from '@innogrid/ui';
import { useMemo, useState } from 'react';
import styles from '@/pages/service/service.module.scss';
import type {
  MetricsPeriod,
  PeriodMetrics,
  ServiceMonitoringData,
} from '@/types/service';
import { formatCount } from '@/util/count';
import { formatDateTime } from '@/util/date';

interface MonitoringTabProps {
  monitoringData?: ServiceMonitoringData | null;
  isLoading?: boolean;
  isError?: boolean;
}

type WorkflowOption = { text: string; value: string }; // value: 'total' | workflow_id
type PeriodOption = { text: string; value: MetricsPeriod };

const TOTAL_VALUE = 'total';

const periodOptions: PeriodOption[] = [
  { text: '최근 1시간', value: '1h' },
  { text: '최근 1일', value: '1d' },
  { text: '최근 1주일', value: '1w' },
];

const metricItems: { key: keyof PeriodMetrics; label: string; format: (value: number) => string }[] =
  [
    { key: 'message_count', label: '총 메시지 수', format: formatCount },
    { key: 'active_users', label: '활성 사용자 수', format: formatCount },
    { key: 'token_usage', label: '토큰 사용량', format: formatCount },
    {
      key: 'avg_interaction_count',
      label: '평균 상호작용 수',
      format: (value) => value.toFixed(1),
    },
    {
      key: 'response_time_ms',
      label: '평균 응답 시간',
      format: (value) => `${value.toFixed(0)} ms`,
    },
    { key: 'error_count', label: '오류 수', format: formatCount },
    { key: 'success_rate', label: '성공률', format: (value) => `${value.toFixed(1)}%` },
  ];

export const MonitoringTab = ({ monitoringData, isLoading, isError }: MonitoringTabProps) => {
  const [selectedWorkflowValue, setSelectedWorkflowValue] = useState<string>(TOTAL_VALUE);
  const [selectedPeriod, setSelectedPeriod] = useState<MetricsPeriod>('1d');

  const workflowOptions = useMemo<WorkflowOption[]>(
    () => [
      { text: '워크플로우 전체', value: TOTAL_VALUE },
      ...(monitoringData?.workflow_metrics.map((wf) => ({
        text: wf.workflow_name,
        value: wf.workflow_id,
      })) ?? []),
    ],
    [monitoringData]
  );

  const selectedWorkflow =
    workflowOptions.find((option) => option.value === selectedWorkflowValue) ?? workflowOptions[0];
  const selectedPeriodOption =
    periodOptions.find((option) => option.value === selectedPeriod) ?? periodOptions[1];

  const metrics: PeriodMetrics | undefined = useMemo(() => {
    if (!monitoringData) return undefined;
    const source =
      selectedWorkflowValue === TOTAL_VALUE
        ? monitoringData.total_metrics
        : monitoringData.workflow_metrics.find((wf) => wf.workflow_id === selectedWorkflowValue)
            ?.metrics;
    return source?.[selectedPeriod];
  }, [monitoringData, selectedWorkflowValue, selectedPeriod]);

  const handleSelectWorkflow = (option: SelectSingleValue<WorkflowOption>) => {
    if (!option) return;
    setSelectedWorkflowValue(option.value);
  };

  const handleSelectPeriod = (option: SelectSingleValue<PeriodOption>) => {
    if (!option) return;
    setSelectedPeriod(option.value);
  };

  if (isLoading) {
    return (
      <div className="tabs-Content">
        <div className={styles.metricEmpty}>모니터링 데이터를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="tabs-Content">
        <div className={styles.metricEmpty}>모니터링 데이터를 불러오지 못했습니다.</div>
      </div>
    );
  }

  if (!monitoringData || !metrics) {
    return (
      <div className="tabs-Content">
        <div className={styles.metricEmpty}>모니터링 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="tabs-Content">
      <div className={styles.selectBox}>
        <Select
          options={workflowOptions}
          getOptionLabel={(option: WorkflowOption) => option.text}
          getOptionValue={(option: WorkflowOption) => option.value}
          value={selectedWorkflow}
          onChange={handleSelectWorkflow}
          menuPosition="fixed"
        />
        <Select
          options={periodOptions}
          getOptionLabel={(option: PeriodOption) => option.text}
          getOptionValue={(option: PeriodOption) => option.value}
          value={selectedPeriodOption}
          onChange={handleSelectPeriod}
          menuPosition="fixed"
        />
      </div>

      <div className={styles.metricGrid}>
        {metricItems.map(({ key, label, format }) => {
          const value = metrics[key];
          return (
            <div key={key} className={styles.metricCard}>
              <span className={styles.metricLabel}>{label}</span>
              <strong className={styles.metricValue}>
                {value === null || value === undefined ? '-' : format(value)}
              </strong>
            </div>
          );
        })}
      </div>

      <div className={styles.metricAggregatedAt}>
        집계 기준: {formatDateTime(monitoringData.aggregated_at)}
      </div>
    </div>
  );
};
