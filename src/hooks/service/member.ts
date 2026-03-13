import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type {
  CreateMemberRequest,
  GetMembersParams,
  Member,
  UpdateMemberRequest,
} from '@/types/member';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
type UpdateMemberPayload = Partial<Omit<UpdateMemberRequest, 'member_id'>> & { member_id: string };

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateMemberRequest) => api.post('members', { json: data }).json<Member>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    createMember: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetMembers = (params: GetMembersParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['members', params],
    queryFn: () => api.get<Page<Member>>('members', { searchParams: { ...params } }).json(),
  });

  return {
    members: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      size: data?.size ?? 1,
      total: data?.total ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetMember = (memberId?: string, enabled: boolean = true) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['members', memberId],
    queryFn: () => api.get(`members/${memberId}`).json<Member>(),
    enabled,
  });

  return {
    member: data,
    isPending,
    isError,
  };
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ member_id, ...data }: UpdateMemberPayload) =>
      // 필요 시 api.patch 로 변경
      api.put(`members/${member_id}`, { json: data }).json<Member>(),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      if (vars?.member_id) {
        queryClient.invalidateQueries({ queryKey: ['members', vars.member_id] });
      }
    },
  });

  return {
    updateMember: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (memberId: string) => api.delete(`members/${memberId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    deleteMember: mutate,
    isPending,
    isError,
    isSuccess,
  };
};
