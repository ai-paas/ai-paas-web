import { describe, it, expect } from 'vitest';
import { kubernetesStatusOf, type NodeKubernetesStatus } from './node-status';
import type { KubernetesNode } from '@/types/cluster';

// 실제 응답 모양 그대로 — 주소는 status.addresses 에 있다. 평평한 internalIP 로 fixture 를
// 만들어 두는 바람에 테스트는 통과하는데 화면은 전부 "조회 불가" 였다.
const k8sNode = (internalIP: string, ready: boolean, name = 'n'): KubernetesNode =>
  ({
    apiVersion: 'v1',
    kind: 'Node',
    metadata: { name },
    spec: {},
    status: {
      conditions: [{ type: 'Ready', status: ready ? 'True' : 'False' }],
      addresses: [
        { type: 'InternalIP', address: internalIP },
        { type: 'Hostname', address: name },
      ],
    },
  }) as KubernetesNode;

const tone = (s: NodeKubernetesStatus) => s.tone;

describe('kubernetesStatusOf', () => {
  it('사설 IP 로 짝지어 Ready 를 읽는다', () => {
    const s = kubernetesStatusOf([k8sNode('10.0.0.1', true)], '10.0.0.1', 'READY');

    expect(s.label).toBe('Ready');
    expect(tone(s)).toBe('positive');
  });

  it('NotReady 는 그대로 드러낸다', () => {
    const s = kubernetesStatusOf([k8sNode('10.0.0.1', false)], '10.0.0.1', 'READY');

    expect(s.label).toBe('NotReady');
    expect(tone(s)).toBe('negative');
  });

  it('클러스터가 아직 준비 전이면 조회할 게 없다고 말한다', () => {
    // '조회 불가' 만 띄우면 장애로 오해한다. 아직 만들고 있다는 사실을 알려야 한다.
    const s = kubernetesStatusOf([], '10.0.0.1', 'PROVISIONING');

    expect(s.label).toBe('대기 중');
    expect(s.reason).toContain('프로비저닝');
  });

  it('READY 인데 노드를 못 찾으면 이유를 남긴다', () => {
    const s = kubernetesStatusOf([], '10.0.0.1', 'READY');

    expect(s.label).toBe('조회 불가');
    expect(s.reason).toContain('에이전트');
  });

  it('사설 IP 가 없으면 짝지을 수 없다', () => {
    const s = kubernetesStatusOf([k8sNode('10.0.0.1', true)], undefined, 'READY');

    expect(s.label).toBe('조회 불가');
  });

  it('IP 가 다른 노드를 잘못 짝짓지 않는다', () => {
    const s = kubernetesStatusOf([k8sNode('10.0.0.9', true)], '10.0.0.1', 'READY');

    expect(s.label).toBe('조회 불가');
  });
});

describe('주소를 읽는 자리', () => {
  it('평평한 internalIP 가 있으면 그것도 받는다', () => {
    // 다른 경로가 이미 풀어 넣어 주는 경우가 있다. 둘 중 하나만 보면 그 화면이 깨진다.
    const flat = {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: { name: 'n' },
      spec: {},
      status: { conditions: [{ type: 'Ready', status: 'True' }] },
      internalIP: '10.0.0.9',
    } as KubernetesNode;

    expect(kubernetesStatusOf([flat], '10.0.0.9', 'READY').label).toBe('Ready');
  });

  it('Hostname 주소를 사설 IP 로 착각하지 않는다', () => {
    const node = {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: { name: 'n' },
      spec: {},
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        addresses: [{ type: 'Hostname', address: '10.0.0.9' }],
      },
    } as KubernetesNode;

    expect(kubernetesStatusOf([node], '10.0.0.9', 'READY').label).toBe('조회 불가');
  });
});
