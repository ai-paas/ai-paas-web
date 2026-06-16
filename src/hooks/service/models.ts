import { api } from '@/lib/api';
import { queryKeys, type HubModelTagParams } from '@/lib/query-keys';
import type { Page } from '@/types/api';
import type {
  CustomModel,
  GetCustomModelsParams,
  GetHubModelsParams,
  GetModelCatalogsParams,
  GetModelFormatsParams,
  GetModelProvidersParams,
  GetModelsParams,
  GetModelTypesParams,
  GetOptimizersParams,
  HubModelsResponse,
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

export const useGetModels = (
  params: GetModelsParams = {},
  { enabled = true }: { enabled?: boolean }
) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.models.list(params),
    queryFn: () => api.get<Page<Model>>('models', { searchParams: { ...params } }).json(),
    enabled,
  });

  return {
    models: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetCustomModels = (params: GetCustomModelsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.customModels.list(params),
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
    queryKey: queryKeys.modelCatalogs.list(params),
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
    queryKey: queryKeys.modelProviders.list(params),
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
    queryKey: queryKeys.modelTypes.list(params),
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
    queryKey: queryKeys.modelFormats.list(params),
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

export const useGetModel = <T = Model>(model_id: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.models.detail(model_id),
    queryFn: () => api.get(`models/${model_id}`).json<T>(),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.modelCatalogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customModels.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.modelCatalogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customModels.all });
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
  // 다중 필터(library/language/apps/inference_provider/other)는 키를 반복해 전달
  // (FastAPI array<string> 규약). 빈 값/빈 배열은 제외.
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });
  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: queryKeys.hubModels.list(params),
    queryFn: () => api.get<HubModelsResponse>('hub-connect/models', { searchParams }).json(),
    placeholderData: keepPreviousData,
  });

  return {
    hubModels: data?.data ?? [],
    page: {
      number: data?.pagination.page ?? 1,
      size: data?.pagination.limit ?? 1,
      total: data?.pagination.total ?? 1,
    },
    // Kaggle 등 total 이 하한값인 마켓에서 다음 페이지 이동 판단용
    hasMore: data?.pagination.has_more ?? false,
    totalIsExact: data?.pagination.total_is_exact ?? true,
    isPending,
    // 페이지/필터/검색 변경 등 모든 요청 진행 중에 true (스켈레톤 표시용)
    isFetching,
    isError,
  };
};

export const useGetHubModelTagsByGroup = (params: HubModelTagParams) => {
  const { data, isFetching, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.hubModelTags.list(params),
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

export const useGetModelForOptimizer = (
  model_id?: number,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.modelForOptimizer.detail(model_id),
    queryFn: () => api.get(`checked/model/${model_id}`).json<{ data: ModelForOptimizer }>(),
    enabled: !!model_id && enabled,
  });

  return {
    modelForOptimizer: data?.data,
    isPending,
    isError,
  };
};

export const useGetOptimizers = (
  params: GetOptimizersParams,
  { enabled = true }: { enabled?: boolean } = {}
) => {
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
    queryKey: queryKeys.optimizers.list(params),
    queryFn: () => api.get<Optimizers>('checked/optimizer', { searchParams }).json(),
    placeholderData: keepPreviousData,
    enabled,
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
