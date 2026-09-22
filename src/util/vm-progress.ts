import type { Vm } from '@/types/vm';

/**
 * 아직 움직이는 중인 상태.
 *
 * <p>DEGRADED 도 여기 든다 — 조정 루프가 애드온을 마저 올리면 READY 로 간다. 멈춘 것으로
 * 보고 폴링을 끄면 화면이 영영 DEGRADED 로 남는다.
 */
const IN_PROGRESS = new Set([
  'REQUESTED',
  'PROVISIONING',
  'BOOTSTRAPPING',
  'VERIFYING',
  'SCALING',
  'UPGRADING',
  'DEGRADED',
  'DELETING',
]);

export const isVmInProgress = (status?: string | null): boolean =>
  !!status && IN_PROGRESS.has(status.toUpperCase());

export const hasVmInProgress = (vms: Vm[] = []): boolean => vms.some((vm) => isVmInProgress(vm.status));

/**
 * 진행 중인 작업이 있을 때만 폴링한다.
 *
 * <p>고정 주기로 계속 부르면 아무것도 변하지 않는 화면에서도 CSP API 까지 왕복이 이어진다.
 * 반대로 끄면 생성 후 PROVISIONING → READY 가 보이지 않아 새로고침을 하게 된다.
 */
export const progressRefetchInterval = (vms: Vm[] = [], intervalMs = 5_000): number | false =>
  hasVmInProgress(vms) ? intervalMs : false;
