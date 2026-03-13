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

export interface ServiceDetail extends Service {
  workflow_count: number;
  workflows: [];
  monitoring_data: {
    total_metrics: {
      message_count: number;
      active_users: number;
      token_usage: number;
      avg_interaction_count: number;
      response_time_ms: number;
      error_count: number;
      success_rate: number;
    };
    workflow_metrics: [];
    period_start: Date;
    period_end: Date;
  };
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
