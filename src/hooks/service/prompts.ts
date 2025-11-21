import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type { CreatePromptRequest, Prompt, UpdatePromptRequest } from '@/types/prompt';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetPrompts = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => api.get(`prompts`).json<Page<Prompt>>(),
  });

  return {
    prompts: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreatePromptRequest) => api.post('prompts', { json: data }).json<Prompt>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  return {
    createPrompt: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetPrompt = (surro_prompt_id: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['prompt', surro_prompt_id],
    queryFn: () => api.get(`prompts/${surro_prompt_id}`).json<Prompt>(),
  });

  return {
    prompt: data,
    isPending,
    isError,
  };
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ surro_prompt_id, ...data }: UpdatePromptRequest) =>
      api.put(`prompts/${surro_prompt_id}`, { json: data }).json<Prompt>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  return {
    updatePrompt: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (surro_prompt_id: string) =>
      api.delete(`prompts/${surro_prompt_id}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  return {
    deletePrompt: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
