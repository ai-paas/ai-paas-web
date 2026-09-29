// 프로비저닝 워크플로의 내부 식별자를 사람이 읽는 말로 바꾼다.
//
// 백엔드의 step, reason 은 로그 상관관계를 잡기 위한 값이라 표현이 제각각이다
// (workflow.step.PROVISION, vmcluster.create, convergence.reconcile ...).
// 화면 사정에 따라 표현이 바뀌므로 매핑은 웹이 갖는다.

const WORKFLOW_STEP_LABEL: Record<string, string> = {
  PROVISION: 'VM 프로비저닝',
  BOOTSTRAP: 'Kubernetes 부트스트랩',
  VERIFY: '연결 확인',
  DESTROY: '제거',
  // 부트스트랩 세부 단계. RUNNING 인데 percent 만 보이면 지금 무엇을 기다리는지 알 수 없다.
  BOOTSTRAP_NODE_PREPARATION: '노드 준비 대기',
  BOOTSTRAP_MASTER_INIT: 'control-plane 초기화',
  BOOTSTRAP_EXTRA_MASTER_JOIN: 'control-plane 조인',
  BOOTSTRAP_WORKER_JOIN: '워커 조인',
  BOOTSTRAP_NODES_READY: '노드 Ready 대기',
  BOOTSTRAP_ADDONS: '애드온 설치',
};

export const workflowStepLabel = (step?: string | null): string =>
  (step && WORKFLOW_STEP_LABEL[step]) || step || '-';

const STATE_REASON_LABEL: Record<string, string> = {
  'vmcluster.create': '생성 요청 접수',
  'workflow.step.PROVISION': '인프라 생성 시작',
  'workflow.step.BOOTSTRAP': 'Kubernetes 설치 시작',
  'workflow.step.VERIFY': '상태 확인 시작',
  'workflow.step.DESTROY': '인프라 삭제 시작',
  'workflow.degraded': '구성 요소 준비 대기',
  'workflow.deleted': '삭제 완료',
  'workflow.failed': '실패',
  'convergence.reconcile': '구성 요소 준비 완료',
  'command.delete': '삭제 요청',
  'command.retry': '재시도 요청',
};

/**
 * 상태 전이 사유를 사람이 읽는 말로. 모르는 값은 원본을 그대로 돌려준다 —
 * 백엔드가 새 reason 을 추가했을 때 빈칸이 되면 안 된다.
 */
export const stateReasonLabel = (reason?: string | null): string =>
  (reason && STATE_REASON_LABEL[reason]) || reason || '';

/** 매핑된 값인지. false 면 화면이 원본을 그대로 보여주고 있다는 뜻이다. */
export const isKnownStateReason = (reason?: string | null): boolean =>
  !!reason && reason in STATE_REASON_LABEL;
