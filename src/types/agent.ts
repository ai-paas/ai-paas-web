export type ClusterAgentStatus =
  | 'REGISTERING'
  | 'REGISTERED'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'FAILED'
  | 'REVOKED';

export interface AdminAgent {
  agentId: string;
  clusterName: string;
  agentInstanceId?: string;
  status: ClusterAgentStatus;
  agentVersion?: string;
  lastSeenAt?: string;
  lastSeenAgeSec?: number;
  lastError?: string;
}

export interface AdminAgentsResponse {
  data: AdminAgent[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}
