import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type {
  CreateModelRequest,
  GetCustomModelsParams,
  GetHubModelsParams,
  GetModelCatalogsParams,
  GetModelFormatsParams,
  GetModelProvidersParams,
  GetModelTypesParams,
  HubModel,
  Model,
  ModelFormat,
  ModelProvider,
  ModelType,
} from '@/types/model';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCustomModels = (params: GetCustomModelsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['models', params],
    queryFn: () =>
      api.get<Page<Model>>('models/custom-models', { searchParams: { ...params } }).json(),
  });

  return {
    customModels: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetModelCatalogs = (params: GetModelCatalogsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['models', params],
    queryFn: () =>
      api.get<Page<Model>>('models/model-catalog', { searchParams: { ...params } }).json(),
  });

  return {
    modelCatalogs: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetModelProviders = (params: GetModelProvidersParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['providers', params],
    queryFn: () =>
      api.get<Page<ModelProvider>>('models/providers', { searchParams: { ...params } }).json(),
  });

  return {
    modelProviders: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetModelTypes = (params: GetModelTypesParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['model-types', params],
    queryFn: () => api.get<Page<ModelType>>('models/types', { searchParams: { ...params } }).json(),
  });

  return {
    modelTypes: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetModelFormats = (params: GetModelFormatsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['model-formats', params],
    queryFn: () =>
      api.get<Page<ModelFormat>>('models/formats', { searchParams: { ...params } }).json(),
  });

  return {
    modelFormats: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetModel = (model_id: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['model', model_id],
    queryFn: () => api.get(`models/${model_id}`).json<Model>(),
  });

  return {
    model: data,
    isPending,
    isError,
  };
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (modelId: number) => api.delete(`models/${modelId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });

  return {
    deleteModel: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateModelRequest) => api.post('models', { json: data }).json<Model>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });

  return {
    createModel: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetHubModels = (params: GetHubModelsParams) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['hub-connect', params],
    queryFn: () => api.get<HubModel>('hub-connect/models', { searchParams: { ...params } }).json(),
    placeholderData: keepPreviousData,
  });

  return {
    hubModels: data?.data ?? [],
    page: {
      number: data?.pagination.page ?? 1,
      size: data?.pagination.limit ?? 1,
      total: data?.pagination.total ?? 1,
    },
    isPending,
    isError,
  };
};
