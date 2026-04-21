export interface GetLearningParams {
  page?: number;
  size?: number;
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

export interface SubmitTrainingRequest {
  model_id: number;
  dataset_id: number;
  train_name: string;
  description: string;
  gpus: string;
  batch_size: string;
  epochs: string;
  save_period: string;
  weight_decay: string;
  lr0: string;
  lrf: string;
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
