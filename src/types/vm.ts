// VM 인프라 자원 타입 — 백엔드 /v1/vms 직접 매핑.
// K8s cluster (registered + agent 자동 등록) 와 분리된 별도 자원.

export type VmStatus =
  | 'REQUESTED'
  | 'PROVISIONING'
  | 'BOOTSTRAPPING'
  | 'VERIFYING'
  | 'READY'
  | 'SCALING'
  | 'UPGRADING'
  | 'FAILED'
  | 'BLOCKED'
  | 'DELETING'
  | 'DELETED';

export type VmWorkflowStep = 'PROVISION' | 'BOOTSTRAP' | 'VERIFY' | 'DESTROY';

export interface Vm {
  // 목록 / 상세 공통 필드 (VmClusterListItemResponse + VmClusterStatusResponse 합집합)
  id?: string;
  clusterName: string;
  clusterProvider?: string;
  status?: VmStatus | string;
  statusDetail?: string;
  currentWorkflowStep?: VmWorkflowStep | string;
  lastSuccessfulStep?: VmWorkflowStep | string;
  lastFailedStep?: VmWorkflowStep | string;
  workflowRetryCount?: number;
  stepStartedAt?: string;
  currentSubStep?: string;
  subStepStartedAt?: string;
  lastErrorCode?: string;
  environment?: string;
  region?: string;
  credentialName?: string;
  credentialSourceType?: string;
  clusterRegistered?: boolean;
  masterVmSpec?: string;
  workerVmSpec?: string;
  osImage?: string;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
  // workflow step transition timestamps (anycloud VmClusterStatusResponse).
  requestedAt?: string;
  provisioningStartedAt?: string;
  bootstrappingStartedAt?: string;
  verifyingStartedAt?: string;
  readyAt?: string;
  failedAt?: string;
  deletingStartedAt?: string;
  deletedAt?: string;
  // 1:1 link — backend FK (vm_cluster.cluster_id → cluster.id) 가 SET 된 경우.
  clusterId?: string;
}

export interface VmCreateRequest {
  // VM 그룹 식별자. master + worker 인스턴스 집합을 묶는 이름. K8s cluster registration 시에도
  // 동일 이름이 cluster.id 로 사용됨 (1:1 매핑).
  vmGroupName: string;
  provider: string;
  region: string;
  environment?: string;
  credentialId: string;
  description?: string;
  config?: Record<string, string>;
  hasGpuNodes?: boolean;
}

export interface VmPatchRequest {
  spec: {
    workerCount?: number;
  };
}

export interface GetVmsParams {
  provider?: string;
  environment?: string;
  status?: string;
}

export interface VmSshKey {
  privateKeyPem?: string;
  publicKey?: string;
  nodeCommands?: Array<{ role: string; ip: string; user: string; command: string }>;
}

export interface VmNode {
  role: string;
  publicIp?: string;
  privateIp?: string;
  sshUser?: string;
  hostname?: string;
}

export interface VmNodeList {
  nodes: VmNode[];
  sshUser?: string;
}
