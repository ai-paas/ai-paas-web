import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type {
  AddFileRequest,
  ChunkType,
  GetKnowledgeBasesParams,
  GetSearchRecordsParams,
  KnowledgeBase,
  Language,
  SearchKnowledgeBaseRequest,
  SearchKnowledgeBaseResponse,
  SearchMethod,
  SearchRecord,
  UpdateKnowledgeBaseRequest,
} from '@/types/knowledgebase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetChunkTypes = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['chunk-types'],
    queryFn: () => api.get('knowledge-bases/chunk-types').json<Page<ChunkType>>(),
  });

  return {
    chunkTypes: data?.data ?? [],
    isPending,
    isError,
  };
};

export const useGetLanguages = () => {
  const { data, isPending, isError, isFetched } = useQuery({
    queryKey: ['languages'],
    queryFn: () => api.get('knowledge-bases/languages').json<Page<Language>>(),
  });

  return {
    languages: data?.data ?? [],
    isPending,
    isError,
    isFetched,
  };
};

export const useGetSearchMethods = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['search-methods'],
    queryFn: () => api.get('knowledge-bases/search-methods').json<Page<SearchMethod>>(),
  });

  return {
    searchMethods: data?.data ?? [],
    isPending,
    isError,
  };
};

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: FormData) =>
      api.post('knowledge-bases', { body: data }).json<KnowledgeBase>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
    },
  });

  return {
    createKnowledgeBase: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetKnowledgeBases = (params: GetKnowledgeBasesParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['knowledge-bases', params],
    queryFn: () =>
      api.get('knowledge-bases', { searchParams: { ...params } }).json<Page<KnowledgeBase>>(),
  });

  return {
    knowledgeBases: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetKnowledgeBase = (surro_knowledge_id: number) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['knowledge-bases', surro_knowledge_id],
    queryFn: () => api.get(`knowledge-bases/${surro_knowledge_id}`).json<KnowledgeBase>(),
    enabled: !!surro_knowledge_id,
  });

  return {
    knowledgeBase: data,
    isPending,
    isError,
  };
};

export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ surro_knowledge_id, ...data }: UpdateKnowledgeBaseRequest) =>
      api.put(`knowledge-bases/${surro_knowledge_id}`, { json: data }).json<KnowledgeBase>(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      queryClient.invalidateQueries({
        queryKey: ['knowledge-bases', variables.surro_knowledge_id],
      });
    },
  });

  return {
    updateKnowledgeBase: mutate,
    updateKnowledgeBaseAsync: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (surro_knowledge_id: number) =>
      api.delete(`knowledge-bases/${surro_knowledge_id}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
    },
  });

  return {
    deleteKnowledgeBase: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useAddFileToKnowledgeBase = (surro_knowledge_id: number) => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: AddFileRequest) => {
      const formData = new FormData();
      formData.append('file', data.file);
      return api
        .post(`knowledge-bases/${surro_knowledge_id}/files`, { body: formData })
        .json<{ file_id: string }>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['knowledge-bases', surro_knowledge_id, 'files'],
      });
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases', surro_knowledge_id] });
    },
  });

  return {
    addFile: mutate,
    addFileAsync: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteFileFromKnowledgeBase = (surro_knowledge_id: number) => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: (file_id: string) =>
      api.delete(`knowledge-bases/${surro_knowledge_id}/files/${file_id}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['knowledge-bases', surro_knowledge_id, 'files'],
      });
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases', surro_knowledge_id] });
    },
  });

  return {
    deleteFile: mutate,
    deleteFileAsync: mutateAsync,
    isPending,
    isError,
    isSuccess,
  };
};

export const useSearchKnowledgeBase = (surro_knowledge_id: number) => {
  const { mutate, mutateAsync, data, isPending, isError, isSuccess } = useMutation({
    mutationFn: (searchParams: SearchKnowledgeBaseRequest) =>
      api
        .post(`knowledge-bases/${surro_knowledge_id}/search`, { json: searchParams })
        .json<SearchKnowledgeBaseResponse>(),
  });

  return {
    search: mutate,
    searchAsync: mutateAsync,
    searchResults: data,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetSearchRecords = (
  surro_knowledge_id: number,
  params: GetSearchRecordsParams = {}
) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['knowledge-bases', surro_knowledge_id, 'search-records', params],
    queryFn: () =>
      api
        .get(`knowledge-bases/${surro_knowledge_id}/search-records`, {
          searchParams: { ...params },
        })
        .json<Page<SearchRecord>>(),
    enabled: !!surro_knowledge_id,
  });

  return {
    searchRecords: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};
