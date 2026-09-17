import { describe, expect, it } from 'vitest';
import { clusterReadiness } from './cluster-readiness';
import type { Cluster } from '@/types/cluster';

const cluster = (over: Partial<Cluster> = {}): Cluster => ({
  clusterName: 'demo',
  status: 'READY',
  agentConnectivity: 'CONNECTED',
  ...over,
});

describe('clusterReadiness', () => {
  it('READY + CONNECTED 만 고를 수 있다', () => {
    expect(clusterReadiness(cluster()).selectable).toBe(true);
  });

  it.each([
    ['PROVISIONING', '프로비저닝 중'],
    ['DEGRADED', '구성 요소 준비 대기'],
    ['FAILED', '프로비저닝 실패'],
    ['DELETING', '삭제됨'],
  ])('상태 %s 는 막고 이유를 준다', (status, reason) => {
    const r = clusterReadiness(cluster({ status: status as Cluster['status'] }));
    expect(r.selectable).toBe(false);
    expect(r.reason).toBe(reason);
  });

  it.each([
    ['NOT_REGISTERED', '에이전트 등록 대기'],
    ['DISCONNECTED', '에이전트 연결 끊김'],
  ])('에이전트 %s 는 막는다', (agent, reason) => {
    const r = clusterReadiness(
      cluster({ agentConnectivity: agent as Cluster['agentConnectivity'] })
    );
    expect(r.selectable).toBe(false);
    expect(r.reason).toBe(reason);
  });

  it('외부 등록 클러스터의 ACTIVE 도 허용한다', () => {
    expect(clusterReadiness(cluster({ status: 'ACTIVE' })).selectable).toBe(true);
  });

  it('agent 정보가 아예 없으면 상태만으로 판정한다', () => {
    // vm 전용 행은 agentConnectivity 가 비어 있다. 그것만으로 막으면 아무것도 못 고른다.
    expect(clusterReadiness(cluster({ agentConnectivity: undefined })).selectable).toBe(true);
  });

  it('클러스터가 없으면 막는다', () => {
    expect(clusterReadiness(undefined).selectable).toBe(false);
  });
});
