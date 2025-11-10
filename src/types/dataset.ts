export interface Dataset {
  id: number;
  name: string;
  description: string | null;
  version: number;
  subversion: number;
  train_ratio: number;
  validation_ratio: number;
  test_ratio: number;
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
}

export interface CreateDatasetRequest {
  name: string;
  description: string;
  file?: string;
}

export interface UpdateDatasetRequest {
  datasetId: number;
  name?: string;
  description?: string;
}
