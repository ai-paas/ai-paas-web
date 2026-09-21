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
  /** 자격증명이 삭제됐으면 더는 조회되지 않는 ID. 이름과 달리 참조다. */
  credentialId?: string;
  credentialSourceType?: string;
  clusterRegistered?: boolean;
  masterVmSpec?: string;
  workerVmSpec?: string;
  osImage?: string;
  lastError?: string;
  /** 실패 원인을 한 줄로 정리한 것. 아는 실패가 아니면 비어 있다. */
  lastErrorSummary?: string;
  /** 사용자가 할 일. lastErrorSummary 와 짝. */
  lastErrorHint?: string;
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

// CSP 무관 클러스터 사양. 7개 CSP 전부에 대응물이 있는 값만 담는다.
export interface ClusterSpecRequest {
  kubernetesVersion?: string;
  masterCount?: number;
  workerCount?: number;
  // Proxmox 는 인스턴스 타입이 없어 "코어-메모리MiB" 형식을 받는다 (예: 4-8192).
  masterInstanceType?: string;
  workerInstanceType?: string;
  rootDiskSizeGb?: number;
  // 표현이 CSP 마다 다르다 — OCI 는 image OCID, Alibaba 는 ECS 이미지 ID.
  osImage?: string;
  sshUser?: string;
  network?: NetworkSpecRequest;
  enableIngress?: boolean;
  enableGpuOperator?: boolean;
  /** 비우면 백엔드가 설치한다. 끄려는 사람만 false 를 보낸다. */
  enableMonitoring?: boolean;
  useSpot?: boolean;
}

export interface NetworkSpecRequest {
  // Proxmox 는 쓰지 않는다. 하이퍼바이저라 기존 브리지에 붙는다.
  vpcCidr?: string;
  podCidr?: string;
  serviceCidr?: string;
}

// provider 마다 스키마가 다르다. 필요한 키는 GET /v1/providers/{provider}/config-schema 로 조회한다.
export type ProviderSpecRequest = Record<string, string | number | boolean>;

export interface VmCreateRequest {
  // VM 그룹 식별자. master + worker 인스턴스 집합을 묶는 이름. K8s cluster registration 시에도
  // 동일 이름이 cluster.id 로 사용됨 (1:1 매핑).
  vmGroupName: string;
  provider: string;
  region: string;
  environment?: string;
  credentialId: string;
  description?: string;
  spec?: ClusterSpecRequest;
  providerSpec?: ProviderSpecRequest;
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
  /** 삭제된 항목도 "함께" 반환. status 를 명시하면 그 필터가 우선한다. */
  includeDeleted?: boolean;
  /** 1-based 페이지. 비우면 게이트웨이 기본값(20건)으로 잘린다. */
  page?: number;
  size?: number;
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

/** VM 목록의 한 행 — 클러스터가 아니라 노드 하나. 백엔드 VmNodeListItemResponse. */
export interface ClusterNode {
  nodeName: string;
  role: string;
  instanceId?: string;
  privateIp?: string;
  publicIp?: string;
  publicDns?: string;
  clusterName: string;
  clusterProvider?: string;
  region?: string;
  environment?: string;
  /** 소속 클러스터의 프로비저닝 상태. 노드별 인스턴스 상태가 아니다. */
  infraStatus?: string;
}

export interface VmNodeList {
  /** 노드가 사설망이라 점프 호스트를 거쳐야 하면 user@host[:port]. 비밀번호는 담기지 않는다. */
  sshJump?: string;
  nodes: VmNode[];
  sshUser?: string;
}
