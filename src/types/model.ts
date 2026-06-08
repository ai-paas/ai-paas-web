export interface Model {
  id: number;
  name: string;
  description: string;
  repo_id: string;
  provider_info: {
    id: number;
    name: string;
    description: string;
  };
  type_info: {
    id: number;
    name: string;
    description: string;
  };
  format_info: {
    id: number;
    name: string;
    description: string;
  };
  parent_model_id: number | null;
  registry: {
    id: number;
    artifact_path: string;
    uri: string;
    reference_model_id: number;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  member_info?: {
    member_id: string;
    role: string;
    name: string;
  };
}

export interface CustomModel {
  id: number;
  name: string;
  repo_id: string;
  description: string | null;
  parameter: string | null;
  sample_code: string | null;
  task: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  parent_model_id: number | null;
  provider_info: {
    id: number;
    name: string;
    description: string;
  };
  format_info: {
    id: number;
    name: string;
    description: string;
  };
  type_info: {
    id: number;
    name: string;
    description: string;
  };
  registry: {
    id: number;
    uri: string;
    artifact_path: string;
    reference_model_id: number;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
  };
}

export interface ModelCatalog {
  id: number;
  name: string;
  repo_id: string;
  description: string;
  parameter: string | null;
  sample_code: string | null;
  task: string | null;
  parent_model_id: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  provider_info: {
    id: number;
    name: string;
    description: string;
  };
  format_info: {
    id: number;
    name: string;
    description: string;
  };
  type_info: {
    id: number;
    name: string;
    description: string;
  };
  registry: {
    id: number;
    uri: string;
    artifact_path: string;
    reference_model_id: number;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
  };
}

export interface ModelProvider {
  id: number;
  name: string;
  description: string;
}

export interface ModelType {
  id: number;
  name: string;
  description: string;
}

export interface ModelFormat {
  id: number;
  name: string;
  description: string;
}

export interface HubModel {
  _id: string | null;
  id: string;
  modelId: string;
  author: string;
  createdAt: string | null;
  lastModified: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag: string;
  task: string;
  library_name: string;
  numParameters: number | null;
  /** 사람이 읽기 쉬운 파라미터 표기. Kaggle은 항상 null */
  parameterDisplay: string | null;
  /** 파라미터 범주 정보. Kaggle은 항상 null */
  parameterRange: string | null;
  private: boolean;
  gated: boolean;
  sha: string | null;
}

export interface HubModelsResponse {
  data: HubModel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    /** 다음 페이지가 있을 가능성 (Kaggle 등 lower-bound total 마켓에서 페이지 이동 판단용) */
    has_more?: boolean;
    /** total 이 정확한 전체 수인지 (HuggingFace=true, Kaggle=false 하한값) */
    total_is_exact?: boolean;
    /** 실제 업스트림에 적용된 필터 정보 */
    applied_filters?: Record<string, unknown>;
  };
}

export interface HubModelTag {
  data: {
    id: string;
    label: string;
    type: string;
  }[];
  remaining_count: number;
}

export interface ModelForOptimizer {
  id: number;
  model_name: string;
  model_task: string;
  run_id: string;
  path: string;
}

export interface Optimizer {
  id: number;
  optimizer_name: string;
  accelerator: string;
  argument: Record<string, string>;
}

export interface Optimizers {
  data: {
    items: Optimizer[];
    current_page: number;
    page_size: number;
    total_count: number;
    total_page: number;
    next_page?: number;
    prev_page?: number;
  };
}

export interface OptimizeRequest {
  optimizer_id: number;
  saved_model_run_id: string;
  saved_model_path: string;
  model_name: string;
  args?: Record<string, string>;
}

export interface GetModelsParams {
  page?: number;
  size?: number;
  search?: string;
  model_type_id?: number;
  model_provider_id?: number;
  model_format_id?: number;
  filter_type?: string;
}

export interface GetCustomModelsParams {
  page?: number;
  size?: number;
  provider_id?: number;
  type_id?: number;
  format_id?: number;
  search?: string;
}

export interface GetModelCatalogsParams {
  page?: number;
  size?: number;
  provider_id?: number;
  type_id?: number;
  format_id?: number;
  search?: string;
}

export interface GetModelProvidersParams {
  page?: number;
  size?: number;
  provider_name?: string;
}

export interface GetModelTypesParams {
  page?: number;
  size?: number;
  type_name?: string;
}

export interface GetModelFormatsParams {
  page?: number;
  size?: number;
  format_name?: string;
}

export interface GetHubModelsParams {
  market: 'huggingface' | 'kaggle';
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
  num_parameters_min?: string | null;
  num_parameters_max?: string | null;
  task?: string;
  library?: string[];
  language?: string[];
  license?: string | null;
  apps?: string[];
  inference_provider?: string[];
  other?: string[];
}

export interface GetOptimizersParams {
  page?: number;
  size?: number;
  name?: string;
  model_id?: number;
}
