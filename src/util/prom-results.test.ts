import { describe, it, expect } from 'vitest';
import { metricsOutage } from './prom-results';

const ok = { status: 'success', data: { resultType: 'vector', result: [] } } as const;
const failed = (error: string) => ({ status: 'error' as const, error });

describe('metricsOutage', () => {
  it('아직 안 받았으면 판단하지 않는다', () => {
    // 로딩 중에 "설치되지 않았습니다" 를 띄우면 매번 깜빡인다.
    expect(metricsOutage(undefined)).toBeUndefined();
  });

  it('다 성공하면 아무 말도 하지 않는다', () => {
    expect(metricsOutage({ a: ok, b: ok })).toBeUndefined();
  });

  it('Prometheus 에 닿지 못하면 설치 여부를 짚어준다', () => {
    // 빈 그래프만 보여주면 고장인지 미설치인지 알 수 없다.
    const outage = metricsOutage({
      a: failed('dial tcp: lookup kube-prometheus-stack-prometheus.monitoring.svc: no such host'),
    });

    expect(outage?.kind).toBe('unreachable');
    expect(outage?.message).toMatch(/Prometheus/);
  });

  it('쿼리 하나만 실패한 것은 장애로 보지 않는다', () => {
    // GPU 지표는 GPU 없는 클러스터에서 빈다. 그것으로 전체를 막으면 안 된다.
    expect(metricsOutage({ a: ok, b: failed('parse error') })).toBeUndefined();
  });

  it('전부 실패했지만 연결 문제가 아니면 그대로 알린다', () => {
    const outage = metricsOutage({ a: failed('bad_data: invalid parameter'), b: failed('boom') });

    expect(outage?.kind).toBe('failed');
    expect(outage?.message).toContain('bad_data: invalid parameter');
  });

  it('원본 사유를 잃지 않는다', () => {
    // 화면 문구만 남기면 운영자가 실제 주소와 포트를 못 본다.
    const outage = metricsOutage({ a: failed('dial tcp: no such host') });

    expect(outage?.detail).toContain('dial tcp: no such host');
  });
});
