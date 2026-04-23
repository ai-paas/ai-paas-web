import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Page } from '@/types/api';
import type {
  GetLearningParams,
  Learning,
  LearningDetail,
  LearningReadResponse,
  LearningStatus,
  RegisterModelRequest,
  RegisterModelResponse,
  SubmitTrainingRequest,
  SubmitTrainingResponse,
  UpdateLearningInternalAccessRequest,
  UpdateLearningRequest,
} from '@/types/learning';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetLearnings = (params: GetLearningParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.learning.list(params),
    queryFn: () => api.get<Page<Learning>>('learning', { searchParams: { ...params } }).json(),
  });

  return {
    learnings: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetLearning = (experiment_id?: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.learning.detail(experiment_id),
    queryFn: () => api.get<LearningDetail>(`learning/${experiment_id}`).json(),
    enabled: !!experiment_id,
  });

  return {
    learning: data,
    isPending,
    isError,
  };
};

export const useGetLearningStatus = (experiment_id?: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.learning.status(experiment_id),
    queryFn: () => api.get<LearningStatus>(`learning/${experiment_id}/status`).json(),
    enabled: !!experiment_id,
  });

  return {
    status: data,
    isPending,
    isError,
  };
};

export const useSubmitTraining = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (body: SubmitTrainingRequest) =>
      api.post('learning/training', { json: body }).json<SubmitTrainingResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    submitTraining: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useRegisterModel = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (body: RegisterModelRequest) =>
      api.post('learning/model/registration', { json: body }).json<RegisterModelResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    registerModel: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useUpdateLearning = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ experimentId, ...body }: UpdateLearningRequest) =>
      api.patch(`learning/${experimentId}`, { json: body }).json<LearningReadResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    updateLearning: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useUpdateLearningInternalAccess = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ experimentId, ...body }: UpdateLearningInternalAccessRequest) =>
      api
        .patch(`learning/${experimentId}/internal-access`, { json: body })
        .json<LearningReadResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    updateLearningInternalAccess: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteLearning = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (experimentId: number) => api.delete(`learning/${experimentId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    deleteLearning: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
