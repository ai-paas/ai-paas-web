export interface GetLearningParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

export interface LearningRefSummary {
  id: number;
  name?: string | null;
  recommended_hparams?: Record<string, string>;
  kind?: DatasetKind | null;
}

export interface Learning {
  id: number;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  registration_status?: string | null;
  registered_model_id?: number | null;
  elapsed_time?: number | null;
  end_time?: string | null;
  reference_model?: LearningRefSummary | null;
  dataset?: LearningRefSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LearningStatus {
  status: string;
  start_time: number;
  end_time?: number | null;
  elapsed_time: number;
  max_epoch: number;
  current_epoch: number;
  loss_history: unknown[];
  epoch_history: unknown[];
  average_precision_50_history: unknown[];
  average_precision_75_history: unknown[];
  best_average_precision_history: unknown[];
  average_precision_50_95_history: unknown[];
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
  description?: string | null;
  reference_model_id: number;
  dataset_id: number;
  kubeflow_run_id?: string | null;
  mlflow_run_id?: string | null;
  status: string;
  reference_model?: Record<string, unknown> | null;
  dataset?: Record<string, unknown> | null;
  hyperparameters?: Record<string, unknown>[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
}

export interface LearningLossPoint {
  epoch: number;
  loss: number;
}

export interface LearningDetail {
  id: number;
  name?: string | null;
  description?: string | null;
  reference_model_id?: number | null;
  dataset_id?: number | null;
  kubeflow_run_id?: string | null;
  mlflow_run_id?: string | null;
  status?: string | null;
  reference_model?: LearningRefSummary | null;
  dataset?: LearningRefSummary | null;
  hyperparameters?: Record<string, unknown>[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  registration_status?: string | null;
  registered_model_id?: number | null;
  train_msg?: string | null;
  model_register_msg?: string | null;
  elapsed_time?: number | null;
  end_time?: string | null;
  max_epoch?: number | null;
  current_epoch?: number | null;
  loss?: number | null;
  loss_history?: LearningLossPoint[] | null;
  average_precision?: number | null;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
}
