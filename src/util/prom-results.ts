/** 쿼리 하나가 아니라 지표 수집 자체가 막혔을 때. */
export interface MetricsOutage {
  /** unreachable = Prometheus 에 닿지 못함, failed = 닿았지만 전부 실패 */
  kind: 'unreachable' | 'failed';
  message: string;
  /** 원본 사유. 화면 문구만 남기면 운영자가 실제 주소와 포트를 못 본다. */
  detail: string;
}

interface QueryOutcome {
  status?: string;
  error?: string;
}

/** 이름 해석 실패나 연결 거부 — 설치되지 않았을 때 나오는 모양. */
const UNREACHABLE = /no such host|connection refused|dial tcp|i\/o timeout/i;

/**
 * 지표 응답 묶음에서 전체 장애를 읽는다.
 *
 * <p>백엔드는 쿼리마다 성공/실패를 따로 담아 200 으로 돌려준다. 실패를 무시하면 값이 0 인 그래프가
 * 그려져, 고장인지 미설치인지 사용자가 알 수 없다.
 *
 * <p>하나만 실패한 것은 장애로 보지 않는다 — GPU 지표는 GPU 없는 클러스터에서 늘 빈다.
 */
export const metricsOutage = (
  results: Record<string, QueryOutcome> | undefined
): MetricsOutage | undefined => {
  if (!results) return undefined;

  const outcomes = Object.values(results);
  if (outcomes.length === 0) return undefined;

  const failures = outcomes.filter((r) => r.status === 'error');
  if (failures.length !== outcomes.length) return undefined;

  const detail = failures.find((f) => f.error)?.error ?? '알 수 없는 오류';
  if (UNREACHABLE.test(detail)) {
    return {
      kind: 'unreachable',
      message:
        'Prometheus 에 닿지 못했습니다. 이 클러스터에 모니터링 스택이 설치되어 있는지 확인해주세요.',
      detail,
    };
  }
  return { kind: 'failed', message: detail, detail };
};
