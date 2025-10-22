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

// 쿠버네티스 노드 타입
export interface KubernetesNode {
  metadata?: {
    name: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  status?: {
    conditions?: Array<{
      type: string;
      status: string;
    }>;
  };
  // 기존 필드들도 유지 (호환성을 위해)
  name?: string;
  roles?: string;
  createdAt?: string;
  version?: string;
  internalIP?: string;
  externalIP?: string;
}

// 쿠버네티스 네임스페이스 타입
export interface KubernetesNamespace {
  metadata?: {
    name: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  status?: {
    phase: string;
  };
  // 기존 필드들도 유지 (호환성을 위해)
  name?: string;
  workspace?: string;
  createdAt?: string;
}

export interface KubernetesDeployment {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  spec?: {
    replicas: number;
  };
  status?: {
    readyReplicas: number;
    replicas: number;
    availableReplicas: number;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesReplicaSet {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
    ownerReferences?: Array<{
      kind: string;
      name: string;
      uid: string;
    }>;
  };
  spec?: {
    replicas: number;
  };
  status?: {
    readyReplicas: number;
    replicas: number;
    availableReplicas: number;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesPod {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
    ownerReferences?: Array<{
      kind: string;
      name: string;
      uid: string;
    }>;
  };
  spec?: {
    containers?: Array<{
      name: string;
      image: string;
    }>;
  };
  status?: {
    phase: string;
    containerStatuses?: Array<{
      name: string;
      ready: boolean;
      restartCount: number;
    }>;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesService {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  spec?: {
    type: string;
    clusterIP: string;
    ports?: Array<{
      port: number;
      targetPort: number;
      protocol: string;
    }>;
  };
  status?: {
    loadBalancer?: {
      ingress?: Array<{
        ip: string;
      }>;
    };
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesDaemonSet {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  spec?: {
    replicas: number;
  };
  status?: {
    readyReplicas: number;
    replicas: number;
    availableReplicas: number;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface GpuScheduling {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  spec?: {
    type: string;
    replicas: number;
  };
  status?: {
    readyReplicas: number;
    replicas: number;
    availableReplicas: number;
  };
  name?: string;
  namespace?: string;
  type?: string;
  createdAt?: string;
}

export interface KubernetesServiceAccount {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesConfigMap {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  data?: {
    [key: string]: string;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}

export interface KubernetesSecret {
  metadata?: {
    name: string;
    namespace: string;
    creationTimestamp: string;
    labels?: {
      [key: string]: string;
    };
  };
  type?: string;
  data?: {
    [key: string]: string;
  };
  name?: string;
  namespace?: string;
  createdAt?: string;
}
