export interface Model {
  id: number;
  name: string;
  description: string;
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

export interface CreateModelRequest {
  name: string;
  description: string;
  provider_id: number;
  type_id: number;
  format_id: number;
  parent_model_id?: number;
  registry_schema?: string;
  file?: string;
}
