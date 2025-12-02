import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type { Dataset, GetDatasetsParams, UpdateDatasetRequest } from '@/types/dataset';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetDatasets = (params: GetDatasetsParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['datasets', params],
    queryFn: () => api.get<Page<Dataset>>('datasets', { searchParams: { ...params } }).json(),
  });

  return {
    datasets: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: FormData) => api.post('datasets', { body: data }).json<Dataset>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    createDataset: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetDataset = (dataset_id: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['datasets', dataset_id],
    queryFn: () => api.get<Dataset>(`datasets/${dataset_id}`).json(),
  });

  return {
    dataset: data,
    isPending,
    isError,
  };
};

export const useUpdateDataset = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ datasetId, ...data }: UpdateDatasetRequest) =>
      api.put(`dataset/${datasetId}`, { json: data }).json<Dataset>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    updateDataset: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (datasetId: number) => api.delete(`datasets/${datasetId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return {
    deleteDataset: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
