// 관리자 대시보드 API 타입 정의
// 출처: GET/POST /api/v1/admin/dashboard/*

/** 8개 자산 도메인 */
export type AssetDomain =
  | 'service'
  | 'workflow'
  | 'model'
  | 'model_improvement'
  | 'dataset'
  | 'experiment'
  | 'knowledge_base'
  | 'prompt';

/** trends 의 domain 파라미터 (자산 도메인 + 가입 추이용 의사 도메인) */
export type TrendDomain = AssetDomain | 'signup';

/** 활동 로그 action enum */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'login'
  | 'logout'
  | 'status_change'
  | 'permission_change';

/** 활동 로그 resource_type enum (자산 도메인 + member) */
export type AuditResourceType = AssetDomain | 'member';

// ────────────────────────────────────────────────────────────
// GET /summary
// ────────────────────────────────────────────────────────────

export interface UserCount {
  total: number;
  /** is_active=true */
  active: number;
  /** is_active=false */
  inactive: number;
  /** 최근 7일 가입 */
  recent7d: number;
  /** { admin: N, user: N } 등 role 별 카운트 */
  by_role: Record<string, number>;
}

/**
 * 자산 도메인 카운트.
 * total = active + inactive + deleted
 * (service/workflow 는 soft-delete 컬럼이 없어 항상 inactive=0, deleted=0)
 */
export interface AssetCount {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}

export interface DashboardSummary {
  users: UserCount;
  services: AssetCount;
  workflows: AssetCount;
  models: AssetCount;
  model_improvements: AssetCount;
  datasets: AssetCount;
  experiments: AssetCount;
  knowledge_bases: AssetCount;
  prompts: AssetCount;
  /** 응답 생성 시각 (UTC, ISO 8601) */
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// GET /me/dashboard/summary — 본인 자산만 집계 (users/infra 섹션 없음)
// ────────────────────────────────────────────────────────────

export interface MeDashboardSummary {
  /** 현재 로그인 사용자 식별자 */
  member_id: string;
  services: AssetCount;
  workflows: AssetCount;
  models: AssetCount;
  model_improvements: AssetCount;
  datasets: AssetCount;
  experiments: AssetCount;
  knowledge_bases: AssetCount;
  prompts: AssetCount;
  /** 응답 생성 시각 (UTC, ISO 8601) */
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// GET /users/top
// ────────────────────────────────────────────────────────────

export interface GetTopUsersParams {
  domain: AssetDomain;
  /** 상위 N명 (1~10, 기본 3) */
  size?: number;
}

export interface TopUserItem {
  member_id: string;
  /** Member 테이블 join 표시명. 매칭 실패 시 null */
  name: string | null;
  count: number;
}

export interface DashboardTopUsers {
  domain: AssetDomain;
  items: TopUserItem[];
}

// ────────────────────────────────────────────────────────────
// GET /infra/status, /infra/nodes, /infra/resources  (MOCK)
// ────────────────────────────────────────────────────────────

export type ClusterStatus = 'connected' | 'disconnected' | 'error' | 'unknown';
export type NodeStatus = 'ready' | 'warning' | 'error' | 'unknown';
export type AcceleratorKind = 'gpu' | 'npu' | 'tpu' | 'other';
export type AcceleratorStatus = 'available' | 'not_available' | 'error';

export interface ClusterInfo {
  name: string;
  status: ClusterStatus;
  last_checked_at: string;
  message: string | null;
}

export interface InfraStatus {
  clusters: ClusterInfo[];
  /** 등록된 클러스터가 1개라도 있으면 true. false면 empty state UI */
  has_data: boolean;
}

export interface ResourceMetric {
  total: number;
  used: number;
  /** "core" | "GiB" 등 */
  unit: string;
}

export interface FilesystemMetric {
  mount: string;
  total: number;
  used: number;
  unit: string;
}

export interface Accelerator {
  kind: AcceleratorKind;
  status: AcceleratorStatus;
  vendor?: string;
  model?: string;
  total?: number;
  used?: number;
  /** "device" */
  unit: string;
  /** memory_used_gib, memory_total_gib, utilization_percent, temperature_celsius 등 자유 키 */
  metrics: Record<string, unknown>;
  message?: string | null;
}

export interface NodeResources {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  filesystems: FilesystemMetric[];
  accelerators: Accelerator[];
}

export interface InfraNode {
  name: string;
  status: NodeStatus;
  resources: NodeResources;
}

export interface InfraNodes {
  cluster: ClusterInfo;
  nodes: InfraNode[];
}

export type InfraResourceType = 'cpu' | 'memory' | 'filesystem' | 'accelerator';

/** /infra/resources 의 node 항목 — 선택한 resource_type 필드만 채워지고 나머지는 null */
export interface InfraResourceNode {
  name: string;
  status: NodeStatus;
  cpu: ResourceMetric | null;
  memory: ResourceMetric | null;
  filesystems: FilesystemMetric[] | null;
  accelerators: Accelerator[] | null;
}

export interface GetInfraNodesParams {
  cluster: string;
}

export interface GetInfraResourcesParams {
  cluster: string;
  resource_type: InfraResourceType;
}

export interface InfraResources {
  cluster: ClusterInfo;
  resource_type: InfraResourceType;
  nodes: InfraResourceNode[];
}

// ────────────────────────────────────────────────────────────
// GET /events
// ────────────────────────────────────────────────────────────

export interface GetEventsParams {
  /** 1부터, 기본 1 */
  page?: number;
  /** 1~200, 기본 20 */
  size?: number;
  resource_type?: AuditResourceType;
  action?: AuditAction;
  /** 액션 수행자 member_id 정확 일치 */
  actor?: string;
  /** 이 시각(UTC) 이후 이벤트만. ISO 8601 */
  since?: string;
}

export interface AuditLog {
  id: number;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string | null;
  actor_member_id: string;
  target_member_id: string | null;
  metadata: Record<string, unknown> | null;
  request_id: string | null;
  ip: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// GET /trends, POST /trends/refresh
// ────────────────────────────────────────────────────────────

export type TrendSource = 'daily_stats' | 'materialized_view' | 'live';
export type TrendMetric = 'created' | 'deleted';

export interface GetTrendsParams {
  /** 과거 N일 (1~365, 기본 30) */
  days?: number;
  /** 단일 도메인 필터. 미지정 시 전체 */
  domain?: TrendDomain;
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendSeries {
  domain: string;
  metric: TrendMetric;
  points: TrendPoint[];
}

export interface DashboardTrends {
  /** 조회 범위 시작 (포함, UTC date) */
  start: string;
  /** 조회 범위 끝 (포함, UTC date) */
  end: string;
  days: number;
  source: TrendSource;
  series: TrendSeries[];
  generated_at: string;
}

export interface TrendsRefreshResult {
  rows_upserted: number;
  refreshed_materialized_view: boolean;
  finished_at: string;
}

// ────────────────────────────────────────────────────────────
// GET /api-metrics, POST /api-metrics/flush
// ────────────────────────────────────────────────────────────

export type StatusClass = '2xx' | '3xx' | '4xx' | '5xx';

export interface GetApiMetricsParams {
  /** 최근 N시간 (1~168, 기본 24) */
  hours?: number;
  /** 경로 패턴 필터 (예: /api/v1/models/{id}) */
  path_pattern?: string;
}

export interface ApiMetricPath {
  path_pattern: string;
  status_class: StatusClass;
  count: number;
  avg_ms: number | null;
  max_ms: number;
  /** 95th percentile (histogram 보간 근사) */
  p95_ms: number | null;
}

export interface ApiMetrics {
  /** 집계 시작 시각 (now - hours) */
  since: string;
  generated_at: string;
  /** 히스토그램 bucket 경계 (999999 = +Inf) */
  buckets_ms: number[];
  paths: ApiMetricPath[];
}

/** POST /api-metrics/flush 응답 — { flushed: N } */
export interface ApiMetricsFlushResult {
  flushed: number;
}

// ────────────────────────────────────────────────────────────
// GET /providers/health, POST /providers/health/probe
// ────────────────────────────────────────────────────────────

export type ProviderName = 'mlops' | 'hub_connect' | 'any_cloud';
export type ProviderStatus = 'healthy' | 'unhealthy' | 'disabled' | 'error';

export interface GetProvidersHealthParams {
  /** 시계열 조회 범위(분, 1~1440, 기본 60) */
  history_minutes?: number;
}

export interface ProviderSnapshot {
  provider: string;
  status: ProviderStatus;
  latency_ms: number | null;
  error: string | null;
  last_checked_at: string;
}

export interface ProviderHistoryPoint {
  ts: string;
  status: ProviderStatus;
  latency_ms: number | null;
}

export interface ProvidersHealth {
  providers: ProviderSnapshot[];
  /** { [provider]: ProviderHistoryPoint[] } 시계열 (오름차순) */
  history: Record<string, ProviderHistoryPoint[]>;
  generated_at: string;
}
