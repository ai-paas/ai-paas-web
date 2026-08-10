export interface GetLearningParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export interface LearningRefSummary {
  id: number;
  name: string;
}

export interface Learning {
  id: number;
  name: string;
  description?: string;
  status: string;
  registration_status: string;
  registered_model_id: number | null;
  elapsed_time: number;
  end_time: string | null;
  reference_model: LearningRefSummary;
  dataset: LearningRefSummary;
  created_at: string;
  updated_at: string;
}

export interface LearningStatus {
  experiment_id: string;
  status: string;
  progress?: number;
  message?: string;
}

/** MLOps 데이터셋 학습 태스크 분류 (DatasetKindEnum) */
export type DatasetKind = 'object-detection' | 'protein-classification';

/** POST learning/training 요청(multipart/form-data). dataset_id와 dataset_file은 둘 중 하나만 사용 */
export interface SubmitTrainingRequest {
  model_id: number;
  train_name: string;
  description: string;
  /** 기존 데이터셋 ID. dataset_file과 XOR */
  dataset_id?: number;
  /** 직접 업로드할 데이터셋 파일. dataset_id와 XOR */
  dataset_file?: File;
  /** 데이터셋 학습 태스크 분류 */
  dataset_kind?: DatasetKind;
  gpus: string;
  batch_size: string;
  epochs: string;
  save_period: string;
  weight_decay: string;
  learning_rate: string;
}

export interface SubmitTrainingResponse {
  experiment_id: number | null;
}

export interface RegisterModelRequest {
  model_name: string;
  description: string;
  experiment_id: number;
}

export interface RegisterModelResponse {
  accepted: boolean;
  experiment_id: number;
  message: string;
}

export interface UpdateLearningRequest {
  experimentId: number;
  name?: string;
  description?: string;
}

export interface UpdateLearningInternalAccessRequest {
  experimentId: number;
  status?: string;
  mlflow_run_id?: string;
  kubeflow_run_id?: string;
  registration_kubeflow_run_id?: string;
}

export interface LearningReadResponse {
  id: number;
  name: string;
  description?: string;
  reference_model_id: number;
  dataset_id: number;
  kubeflow_run_id?: string;
  mlflow_run_id?: string;
  status: string;
  reference_model: Record<string, unknown>;
  dataset: Record<string, unknown>;
  hyperparameters: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

export interface LearningLossPoint {
  epoch: number;
  loss: number;
}

export interface LearningDetail {
  id: number;
  name: string;
  description?: string;
  reference_model_id: number;
  dataset_id: number;
  kubeflow_run_id?: string;
  mlflow_run_id?: string;
  status: string;
  reference_model: LearningRefSummary;
  dataset: LearningRefSummary;
  hyperparameters: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
  registration_status: string;
  registered_model_id: number;
  train_msg?: string;
  model_register_msg?: string;
  elapsed_time: number;
  end_time?: string;
  max_epoch: number;
  current_epoch: number;
  loss: number;
  loss_history: LearningLossPoint[];
  average_precision: number;
  accuracy: number;
  precision: number;
  recall: number;
}
