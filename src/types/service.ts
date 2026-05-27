export interface Service {
  id: number;
  name: string;
  description: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  surro_service_id: string;
}

export interface WorkflowRef {
  id: string;
  name: string;
}

export interface ServiceWorkflowBrief {
  id: string;
  name: string;
  description: string | null;
  status: string;
  is_template: boolean;
  template_id: string | null;
  category: string | null;
  tags: string[];
  workflow_definition: Record<string, unknown> | null;
  service_id: string;
  creator_id: number;
  kubeflow_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitoringMetrics {
  message_count: number;
  active_users: number;
  token_usage: number;
  avg_interaction_count: number;
  response_time_ms: number;
  error_count: number;
  success_rate: number;
}

export interface WorkflowMonitoringMetrics {
  workflow_id: string;
  workflow_name: string;
  metrics: MonitoringMetrics;
  last_updated: string;
}

export interface ServiceMonitoringData {
  total_metrics: MonitoringMetrics;
  workflow_metrics: WorkflowMonitoringMetrics[];
  period_start: string;
  period_end: string;
}

export interface KnowledgeBaseSummary {
  id: number;
  name: string;
  description: string | null;
  type: string;
  collection_name: string;
  embedding_model_id: number;
  search_method_id: number;
  created_by: string;
  created_at: string;
  workflow_refs: WorkflowRef[];
}

export interface ModelSummary {
  id: number;
  name: string;
  description: string | null;
  provider: string;
  model_type: string;
  format: string;
  task: string;
  visibility: string;
  created_at: string;
  workflow_refs: WorkflowRef[];
}

export interface PromptSummary {
  id: number;
  name: string;
  description: string | null;
  content: string;
  variables: string[];
  created_at: string;
  created_by: string;
  workflow_refs: WorkflowRef[];
}

export interface ServiceDetail extends Service {
  workflow_count: number;
  workflows: ServiceWorkflowBrief[];
  monitoring_data: ServiceMonitoringData | null;
  knowledge_bases: KnowledgeBaseSummary[];
  models: ModelSummary[];
  prompts: PromptSummary[];
}

export interface GetServicesParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  tags: string[];
}

export interface UpdateServiceRequest extends CreateServiceRequest {
  surro_service_id: string;
}
