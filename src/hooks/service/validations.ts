import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface ClusterValidationRequest {
  clusterProvider: string;
  clusterName: string;
  description?: string;
  environment: string;
  region: string;
  credentialId?: string;
  config?: Record<string, string>;
  hasGpuNodes?: boolean;
  [key: string]: unknown;
}

export interface ClusterValidationResponse {
  readyToProvision?: boolean;
  existingClusterConflict?: boolean;
  provider?: string;
  clusterName?: string;
  environment?: string;
  region?: string;
  stackName?: string;
  errors?: string[];
  warnings?: string[];
  [key: string]: unknown;
}

// 클러스터 생성 사전 검증
export const useValidateCluster = (options?: {
  onSuccess?: (data: ClusterValidationResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, isError, isSuccess, error, data } = useMutation({
    mutationKey: ['validateCluster'],
    mutationFn: (body: ClusterValidationRequest) =>
      api
        .post('any-cloud/system/cluster-validations', { json: body })
        .json<ClusterValidationResponse>(),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (err) => options?.onError?.(err),
  });

  return { validateCluster: mutate, isPending, isError, isSuccess, error, data };
};

// 클러스터 생성 미리보기 (Pulumi preview, 수십 초 소요 가능)
export const usePreviewCluster = (options?: {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}) => {
  const { mutate, isPending, isError, isSuccess, error, data } = useMutation({
    mutationKey: ['previewCluster'],
    mutationFn: (body: ClusterValidationRequest) =>
      api.post('any-cloud/system/cluster-validations/preview', { json: body }).json<unknown>(),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (err) => options?.onError?.(err),
  });

  return { previewCluster: mutate, isPending, isError, isSuccess, error, data };
};
