import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Page } from '../../types/api';
import type {
  CreateServiceRequest,
  GetServicesParams,
  Service,
  ServiceDetail,
  UpdateServiceRequest,
} from '../../types/service';

export const useGetServices = (params: GetServicesParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['services', params],
    queryFn: () => api.get<Page<Service>>('services', { searchParams: { ...params } }).json(),
  });

  return {
    services: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateServiceRequest) =>
      api.post('services', { json: data }).json<Service>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    createService: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetService = (surro_service_id?: string, enabled: boolean = true) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['services', surro_service_id],
    queryFn: () => api.get(`services/${surro_service_id}`).json<ServiceDetail>(),
    enabled,
  });

  return {
    service: data,
    isPending,
    isError,
  };
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ surro_service_id, ...data }: UpdateServiceRequest) =>
      api.put(`services/${surro_service_id}`, { json: data }).json<Service>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    updateService: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (surro_service_id: string) =>
      api.delete(`services/${surro_service_id}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    deleteService: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
