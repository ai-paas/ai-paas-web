import { describe, expect, it } from 'vitest';
import { isKnownStateReason, stateReasonLabel, workflowStepLabel } from './provisioning-labels';

describe('workflowStepLabel', () => {
  it('알려진 단계를 우리말로 바꾼다', () => {
    expect(workflowStepLabel('BOOTSTRAP')).toBe('Kubernetes 부트스트랩');
  });

  it('모르는 단계는 원본을 그대로 둔다', () => {
    // 백엔드가 단계를 추가했을 때 빈칸이 되면 화면에서 원인을 못 읽는다.
    expect(workflowStepLabel('SCALE_OUT')).toBe('SCALE_OUT');
  });

  it('없으면 하이픈', () => {
    expect(workflowStepLabel(undefined)).toBe('-');
    expect(workflowStepLabel(null)).toBe('-');
  });

  it.each([
    ['BOOTSTRAP_NODE_PREPARATION', '노드 준비 대기'],
    ['BOOTSTRAP_MASTER_INIT', 'control-plane 초기화'],
    ['BOOTSTRAP_WORKER_JOIN', '워커 조인'],
    ['BOOTSTRAP_NODES_READY', '노드 Ready 대기'],
    ['BOOTSTRAP_ADDONS', '애드온 설치'],
  ])('부트스트랩 세부 단계 %s → %s', (step, expected) => {
    // RUNNING 인데 percent 만 보이면 지금 무엇을 기다리는지 알 수 없다.
    expect(workflowStepLabel(step)).toBe(expected);
  });
});

describe('stateReasonLabel', () => {
  it.each([
    ['vmcluster.create', '생성 요청 접수'],
    ['workflow.step.PROVISION', '인프라 생성 시작'],
    ['workflow.degraded', '구성 요소 준비 대기'],
    ['convergence.reconcile', '구성 요소 준비 완료'],
    ['command.delete', '삭제 요청'],
  ])('%s → %s', (reason, expected) => {
    expect(stateReasonLabel(reason)).toBe(expected);
  });

  it('모르는 사유는 원본을 그대로 둔다', () => {
    expect(stateReasonLabel('convergence.repaired')).toBe('convergence.repaired');
  });

  it('없으면 빈 문자열', () => {
    expect(stateReasonLabel(undefined)).toBe('');
  });
});

describe('isKnownStateReason', () => {
  it('매핑 여부를 구분한다', () => {
    expect(isKnownStateReason('workflow.deleted')).toBe(true);
    expect(isKnownStateReason('something.new')).toBe(false);
    expect(isKnownStateReason(undefined)).toBe(false);
  });
});
