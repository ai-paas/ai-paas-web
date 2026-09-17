import type { StatusTone } from '@/components/ui/status-badge';

// 도메인별 상태 → 색. 판정이 흩어져 있으면 같은 상태가 화면마다 다른 색으로 보인다.

/** VM 프로비저닝 / 클러스터 수명주기. */
export const clusterStatusTone = (status?: string | null): StatusTone => {
  switch (status) {
    case 'READY':
    case 'ACTIVE':
    case 'IMPORTED':
      return 'run';
    case 'FAILED':
    case 'BLOCKED':
    case 'DELETED':
      return 'negative';
    case 'DEGRADED':
      return 'warning';
    case 'PROVISIONING':
    case 'BOOTSTRAPPING':
    case 'VERIFYING':
    case 'DELETING':
    case 'SCALING':
    case 'UPGRADING':
      return 'ing';
    default:
      return 'temp';
  }
};

/** 작업(operation) 상태. */
export const operationStateTone = (state?: string | null): StatusTone => {
  switch (state) {
    case 'SUCCEEDED':
      return 'run';
    case 'FAILED':
    case 'CANCELLED':
      return 'negative';
    case 'RUNNING':
      return 'ing';
    default:
      return 'temp';
  }
};

/** cluster-agent 연결 상태. */
export const agentConnectivityTone = (connectivity?: string | null): StatusTone => {
  switch (connectivity) {
    case 'CONNECTED':
      return 'run';
    case 'DEGRADED':
      return 'warning';
    case 'DISCONNECTED':
    case 'NOT_REGISTERED':
      return 'negative';
    default:
      return 'temp';
  }
};

/** 애드온 설치 상태. */
export const addonStateTone = (state?: string | null): StatusTone => {
  switch (state?.toUpperCase()) {
    case 'INSTALLED':
    case 'READY':
    case 'SUCCEEDED':
      return 'run';
    case 'FAILED':
    case 'DELETED':
      return 'negative';
    case 'INSTALLING':
    case 'PENDING':
      return 'ing';
    default:
      return 'temp';
  }
};

/**
 * 클러스터 health probe 결과.
 *
 * 값이 backend 여러 곳에서 오고 표기가 제각각이라(HEALTHY/OK/UP/ACTIVE) 대문자로 맞춰 본다.
 */
export const healthStatusTone = (status?: string | null): StatusTone => {
  switch (status?.toUpperCase()) {
    case 'HEALTHY':
    case 'OK':
    case 'READY':
    case 'UP':
    case 'ACTIVE':
      return 'run';
    case 'UNHEALTHY':
    case 'FAILED':
    case 'CRITICAL':
    case 'DOWN':
      return 'negative';
    case 'DEGRADED':
    case 'WARNING':
      return 'warning';
    default:
      return 'temp';
  }
};
