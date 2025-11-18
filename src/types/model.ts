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
  created_at: Date;
  updated_at: Date;
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
  parameterDisplay: string;
  parameterRange: string;
  private: boolean;
  gated: boolean;
  sha: string | null;
}

export interface HubModelTag {
  data: {
    id: string;
    label: string;
    type: string;
  }[];
  remaining_count: number;
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
  market: string;
  sort?: string;
  page?: number;
  limit?: number;
  search?: string;
  num_parameters_min?: string | null;
  num_parameters_max?: string | null;
  task?: string;
  library?: string[];
  language?: string[];
  license?: string[];
  apps?: string[];
  inference_provider?: string[];
  other?: string[];
}
