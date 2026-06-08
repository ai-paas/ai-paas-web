import { useNavigate } from 'react-router';

import { useGetMeDashboardMonitoring } from '@/hooks/service/dashboard';
import type { MeMonitoringMetric } from '@/types/dashboard';
import type { MetricsPeriod, PeriodMetrics } from '@/types/service';
import { formatCount } from '@/util/count';
import styles from '@/pages/dashboard/dashboard.module.scss';

// ────────────────────────────────────────────────────────────
// 서비스 모니터링 (GET /me/dashboard/monitoring)
// 본인 서비스의 기간별 메트릭별 Top N (서버 사전 집계 결과 사용).
// top 에 없는 메트릭(에러 수)은 응답의 services[].metrics 에서 직접 집계.
// ────────────────────────────────────────────────────────────

const MONITORING_TOP_N = 5;
// 대시보드 Top 5는 최근 1일(1d) 누적 기준
const MONITORING_PERIOD: MetricsPeriod = '1d';

const monitoringMetrics: { key: keyof PeriodMetrics; label: string }[] = [
  { key: 'message_count', label: '총 메시지 수' },
  { key: 'active_users', label: '활성 사용자 수' },
  { key: 'token_usage', label: '토큰 사용량' },
  { key: 'error_count', label: '에러 수' },
];

export const MonitoringSection = () => {
  const navigate = useNavigate();
  const { services, top } = useGetMeDashboardMonitoring({ top_n: MONITORING_TOP_N });

  const periodTop = top[MONITORING_PERIOD];

  const getTop5 = (key: keyof PeriodMetrics) => {
    // 서버가 기간별로 미리 순위를 매겨 둔 메트릭은 그대로 사용
    const ranked = periodTop?.[key as MeMonitoringMetric];
    if (ranked) {
      return ranked.map((item) => ({
        id: item.surro_service_id,
        name: item.name,
        value: item.value,
      }));
    }
    // top 에 없는 메트릭(에러 수)은 기간 메트릭에서 직접 집계
    return services
      .map((service) => ({
        id: service.surro_service_id,
        name: service.name,
        value: service.metrics[MONITORING_PERIOD]?.[key] ?? 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, MONITORING_TOP_N);
  };

  return (
    <div className="page-detail-round-box page-flex-1">
      <div className="page-detail-round-name">서비스 모니터링</div>
      <div className="page-detail-round-data">
        <div className="page-content-detail-row2">
          {monitoringMetrics.map(({ key, label }) => {
            const top5 = getTop5(key);

            return (
              <div
                key={key}
                className="page-detail-round-box page-detail-round-color page-flex-1 page-mt-0"
              >
                <div className="page-detail-round-name">{label} Top 5</div>
                <div className="page-detail-round-data page-h-177">
                  <div className={styles.msgBox}>
                    {top5.length === 0 ? (
                      <div>
                        <span>데이터 없음</span>
                        <em>-</em>
                      </div>
                    ) : (
                      top5.map((item) => (
                        <div
                          key={item.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/service/${item.id}`)}
                        >
                          <span>{item.name}</span>
                          <em>{formatCount(item.value)}</em>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
