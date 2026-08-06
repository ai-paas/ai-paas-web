export type DatasetKind = 'object-detection' | 'protein-classification';

export interface DatasetKindInfo {
  name: string;
  description: string | null;
  accepted_formats: string[];
  supported_models: string[];
}

export interface Dataset {
  id: number;
  name: string;
  description: string | null;
  kind: DatasetKind | null;
  dataset_registry: {
    id: number;
    artifact_path: string;
    uri: string;
    dataset_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    created_by: string;
    updated_by: string;
    deleted_by: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
  deleted_by: string;
  member_info?: {
    member_id: string;
    role: string;
    name: string;
  };
}

export interface GetDatasetsParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export interface ValidateDatasetResponse {
  is_valid: boolean;
  message: string;
  details?: {
    errors?: string[];
  } | null;
}

export interface UpdateDatasetRequest {
  datasetId: number;
  name?: string;
  description?: string;
}
