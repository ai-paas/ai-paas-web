import type { KubernetesNode } from '@/types/cluster';

export type StatusTone = 'positive' | 'negative' | 'wait' | 'neutral';

export interface NodeKubernetesStatus {
  label: string;
  tone: StatusTone;
  /** 값이 없을 때만 채운다. 사용자가 장애와 '아직 없음'을 구분하려면 이유가 필요하다. */
  reason?: string;
}

/**
 * 노드의 사설 IP.
 *
 * <p>쿠버네티스는 주소를 {@code status.addresses} 에 담아 보낸다. 평평한 {@code internalIP} 는
 * 아무도 채우지 않아, 그 값만 보던 동안 모든 노드가 "조회 불가" 로 보였다.
 */
const internalIpOf = (node: KubernetesNode): string | undefined =>
  node.internalIP ??
  node.status?.addresses?.find((a) => a.type === 'InternalIP')?.address;

/** 클러스터가 이 상태면 쿠버네티스에 물어볼 것이 아직 없다. */
const NOT_YET = new Set(['REQUESTED', 'PROVISIONING', 'BOOTSTRAPPING', 'VERIFYING']);
const GONE = new Set(['DELETING', 'DELETED', 'FAILED', 'BLOCKED']);

/**
 * 인프라 노드 하나에 대응하는 쿠버네티스 상태.
 *
 * <p>둘은 출처가 다르다 — 인프라는 Pulumi outputs, 쿠버네티스는 에이전트다.
 * 사설 IP 로 짝짓는다. 노드 이름은 CSP 마다 규칙이 달라 믿을 수 없다.
 */
export const kubernetesStatusOf = (
  kubernetesNodes: KubernetesNode[],
  privateIp: string | undefined,
  infraStatus: string | undefined
): NodeKubernetesStatus => {
  const status = (infraStatus ?? '').toUpperCase();

  if (NOT_YET.has(status)) {
    return { label: '대기 중', tone: 'wait', reason: '프로비저닝이 끝나야 노드가 클러스터에 참여합니다.' };
  }
  if (GONE.has(status)) {
    return { label: '-', tone: 'neutral', reason: '클러스터가 동작 중이 아닙니다.' };
  }

  const match = privateIp ? kubernetesNodes.find((n) => internalIpOf(n) === privateIp) : undefined;
  if (!match) {
    return {
      label: '조회 불가',
      tone: 'neutral',
      reason: '에이전트로 노드 상태를 가져오지 못했습니다. 에이전트 연결을 확인해주세요.',
    };
  }

  const ready = match.status?.conditions?.find((c) => c.type === 'Ready')?.status === 'True';
  return ready ? { label: 'Ready', tone: 'positive' } : { label: 'NotReady', tone: 'negative' };
};
