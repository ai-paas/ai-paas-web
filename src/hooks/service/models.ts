import { api } from '@/lib/api';
import type { Page, Pagintaion } from '@/types/api';
import type {
  CustomModel,
  GetCustomModelsParams,
  GetHubModelsParams,
  GetModelCatalogsParams,
  GetModelFormatsParams,
  GetModelProvidersParams,
  GetModelTypesParams,
  GetOptimizersParams,
  HubModel,
  HubModelTag,
  Model,
  ModelCatalog,
  ModelFormat,
  ModelForOptimizer,
  ModelProvider,
  ModelType,
  OptimizeRequest,
  Optimizers,
} from '@/types/model';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCustomModels = (params: GetCustomModelsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['custom-models', params],
    queryFn: () =>
      api.get<Page<CustomModel>>('models/custom-models', { searchParams: { ...params } }).json(),
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
    queryKey: ['model-catalogs', params],
    queryFn: () =>
      api.get<Page<ModelCatalog>>('models/model-catalog', { searchParams: { ...params } }).json(),
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
      queryClient.invalidateQueries({ queryKey: ['model-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['custom-models'] });
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

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: FormData) => api.post('models', { body: data }).json<Model>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['custom-models'] });
    },
  });

  return {
    createModel: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetHubModels = (params: GetHubModelsParams) => {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );
  const { data, isPending, isError } = useQuery({
    queryKey: ['hub-connect', params],
    queryFn: () => api.get<Pagintaion<HubModel>>('hub-connect/models', { searchParams }).json(),
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

export const useGetHubModelTagsByGroup = (params: {
  group: 'region' | 'library' | 'task' | 'framework' | 'language';
  market: string;
}) => {
  const { data, isFetching, isPending, isError, refetch } = useQuery({
    queryKey: ['hub-connect-tags', params],
    queryFn: () =>
      api.get<HubModelTag>(`hub-connect/tags/${params.group}`, { searchParams: params }).json(),
  });

  return {
    hubModelTags: data?.data,
    remaining_count: data?.remaining_count,
    isFetching,
    isPending,
    isError,
    refetch,
  };
};

export const useGetModelForOptimizer = (model_id?: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['modelForOptimizer', model_id],
    queryFn: () => api.get(`checked/model/${model_id}`).json<{ data: ModelForOptimizer }>(),
    enabled: !!model_id,
  });

  return {
    modelForOptimizer: data?.data,
    isPending,
    isError,
  };
};

export const useGetOptimizers = (params: GetOptimizersParams) => {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );
  const { data, isPending, isError } = useQuery({
    queryKey: ['optimizers', params],
    queryFn: () => api.get<Optimizers>('checked/optimizer', { searchParams }).json(),
    placeholderData: keepPreviousData,
  });

  return {
    optimizers: data?.data.items ?? [],
    page: {
      number: data?.data.current_page ?? 1,
      size: data?.data.page_size ?? 1,
      total: data?.data.total_count ?? 1,
    },
    isPending,
    isError,
  };
};

export const useOptimize = () => {
  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ optimizer_id, ...body }: OptimizeRequest) =>
      api.post(`optimize/optimize/${optimizer_id}`, { json: body }).json<Model>(),
  });

  return {
    optimize: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};
