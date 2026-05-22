export interface Cluster {
  id: string;
  description: string;
  version: string;
  apiServerUrl: string;
  apiServerIp: string;
  serverCa: string;
  clientCa: string;
  clientKey: string;
  clientToken: string | null;
  monitServerUrl: string | null;
  clusterType: string;
  clusterProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetClustersParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateClusterRequest {
  clusterType: string;
  clusterProvider: string;
  clusterName: string;
  description: string;
  apiServerIp: string;
  apiServerUrl: string;
  serverCA: string;
  clientCA: string;
  clientKey: string;
  clientToken?: string;
  monitServerURL: string;
}

export interface UpdateClusterRequest {
  clusterId: string;
  clusterType: string;
  clusterProvider: string;
  clusterName: string;
  description: string;
  apiServerIp: string;
  apiServerUrl: string;
  serverCA: string;
  clientCA: string;
  clientKey: string;
  clientToken?: string;
  monitServerURL: string;
}

type KubernetesMetadata<TNamespaced extends boolean = true> = {
  name: string;
  creationTimestamp: string;
  deletionTimestamp?: string;
  labels?: {
    [key: string]: string;
  };
  ownerReferences?: Array<{
    kind: string;
    name: string;
    uid: string;
  }>;
  uid?: string;
} & (TNamespaced extends true ? { namespace: string } : { namespace?: never });

interface KubernetesResource<TKind extends string, TNamespaced extends boolean = true> {
  apiVersion: string;
  kind: TKind;
  metadata: KubernetesMetadata<TNamespaced>;
}

// 쿠버네티스 노드 타입
export interface KubernetesNode extends KubernetesResource<'Node', false> {
  spec: {
    taints?: Array<{
      key?: string;
      effect?: string;
    }>;
  };
  status: {
    conditions?: Array<{
      type: string;
      status: string;
    }>;
    capacity?: {
      [key: string]: string;
    };
    allocatable?: {
      [key: string]: string;
    };
    nodeInfo?: {
      osImage?: string;
      kubeletVersion?: string;
    };
  };
  roles?: string;
  version?: string;
  internalIP?: string;
  externalIP?: string;
}

// 쿠버네티스 네임스페이스 타입
export interface KubernetesNamespace extends KubernetesResource<'Namespace', false> {
  status: {
    phase: string;
  };
  workspace?: string;
}

export interface KubernetesDeployment extends KubernetesResource<'Deployment'> {
  spec: {
    replicas?: number;
  };
  status: {
    readyReplicas?: number;
    replicas?: number;
    availableReplicas?: number;
  };
}

export interface KubernetesReplicaSet extends KubernetesResource<'ReplicaSet'> {
  spec: {
    replicas?: number;
  };
  status: {
    readyReplicas?: number;
    replicas?: number;
    availableReplicas?: number;
  };
}

export interface KubernetesPod extends KubernetesResource<'Pod'> {
  spec: {
    nodeName?: string;
    schedulerName?: string;
    containers?: Array<{
    name: string;
      image: string;
      resources?: {
        requests?: {
          [key: string]: string;
        };
        limits?: {
          [key: string]: string;
        };
      };
    }>;
  };
  status: {
    phase: string;
    reason?: string;
    startTime?: string;
    podIP?: string;
    hostIP?: string;
    containerStatuses?: Array<{
      name: string;
      ready: boolean;
      restartCount: number;
      state?: {
        waiting?: {
          reason?: string;
          message?: string;
        };
        running?: {
          startedAt?: string;
        };
        terminated?: {
          reason?: string;
          exitCode?: number;
          signal?: number;
          finishedAt?: string;
        };
      };
    }>;
    initContainerStatuses?: Array<{
      name: string;
      ready?: boolean;
      restartCount?: number;
      state?: {
        waiting?: {
          reason?: string;
          message?: string;
        };
        running?: {
          startedAt?: string;
        };
        terminated?: {
          reason?: string;
          exitCode?: number;
          signal?: number;
          finishedAt?: string;
        };
      };
    }>;
    conditions?: Array<{
      type?: string;
      status?: string;
    }>;
  };
}

export interface KubernetesService extends KubernetesResource<'Service'> {
  spec: {
    type: string;
    clusterIP: string;
    ports?: Array<{
      port: number;
      targetPort: number;
      protocol: string;
    }>;
  };
  status: {
    loadBalancer?: {
      ingress?: Array<{
        ip: string;
      }>;
    };
  };
}

export interface KubernetesDaemonSet extends KubernetesResource<'DaemonSet'> {
  spec: {
    replicas?: number;
  };
  status: {
    readyReplicas?: number;
    replicas?: number;
    availableReplicas?: number;
  };
}

export interface GpuScheduling extends KubernetesResource<string> {
  spec: {
    type?: string;
    replicas?: number;
  };
  status: {
    readyReplicas?: number;
    replicas?: number;
    availableReplicas?: number;
  };
}

export type KubernetesServiceAccount = KubernetesResource<'ServiceAccount'>;

export interface KubernetesConfigMap extends KubernetesResource<'ConfigMap'> {
  data?: {
    [key: string]: string;
  };
}

export interface KubernetesSecret extends KubernetesResource<'Secret'> {
  type?: string;
  data?: {
    [key: string]: string;
  };
}
