import type { Cluster } from '@/types/cluster';

// 클러스터를 관측할 수 있는지 판정한다.
//
// 모니터링, 워크로드 조회는 agent 를 통해 온다. agent 가 끊겨 있으면 빈 그래프가 나오는데
// 화면에서는 "데이터가 없다" 로 읽혀 원인을 알 수 없다. 고르기 전에 막고 이유를 보여준다.

export interface ClusterReadiness {
  selectable: boolean;
  /** 선택할 수 없는 이유. selectable 이면 빈 문자열. */
  reason: string;
}

export const clusterReadiness = (cluster?: Cluster): ClusterReadiness => {
  if (!cluster) return { selectable: false, reason: '클러스터 없음' };

  const status = cluster.status;
  if (status !== 'READY' && status !== 'ACTIVE' && status !== 'IMPORTED') {
    return { selectable: false, reason: statusReason(status) };
  }

  const agent = cluster.agentConnectivity;
  if (agent && agent !== 'CONNECTED') {
    return { selectable: false, reason: agentReason(agent) };
  }
  return { selectable: true, reason: '' };
};

const statusReason = (status?: string): string => {
  switch (status) {
    case 'PROVISIONING':
    case 'BOOTSTRAPPING':
    case 'VERIFYING':
      return '프로비저닝 중';
    case 'DEGRADED':
      return '구성 요소 준비 대기';
    case 'FAILED':
      return '프로비저닝 실패';
    case 'DELETING':
    case 'DELETED':
      return '삭제됨';
    case 'BLOCKED':
      return '차단됨';
    default:
      return status ? `상태 ${status}` : '상태 미상';
  }
};

const agentReason = (agent?: string): string => {
  switch (agent) {
    case 'NOT_REGISTERED':
      return '에이전트 등록 대기';
    case 'DISCONNECTED':
      return '에이전트 연결 끊김';
    case 'DEGRADED':
      return '에이전트 응답 지연';
    default:
      return agent ? `에이전트 ${agent}` : '에이전트 상태 미상';
  }
};
