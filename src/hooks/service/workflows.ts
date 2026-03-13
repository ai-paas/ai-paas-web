import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type {
  ComponentDeployStatusBody,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  UpdateWorkflowTemplateRequest,
  Workflow,
  WorkflowComponentType,
  WorkflowModel,
  WorkflowTemplate,
} from '@/types/workflow';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetWorkflows = (params: {
  page?: number;
  size?: number;
  search?: string;
  creator_id?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'ERROR';
}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', params],
    queryFn: () => api.get<Page<Workflow>>('workflows', { searchParams: { ...params } }).json(),
  });

  return {
    workflows: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      total: data?.total ?? 1,
      size: data?.size ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetWorkflowComponentTypes = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', 'component-types'],
    queryFn: () => api.get<Page<WorkflowComponentType>>('workflows/component-types').json(),
  });

  return {
    workflowComponentTypes: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      total: data?.total ?? 1,
      size: data?.size ?? 1,
    },
    isPending,
    isError,
  };
};

export const useGetTemplates = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', 'templates'],
    queryFn: () => api.get<Page<WorkflowTemplate>>('workflows/templates').json(),
  });

  return {
    workflowTemplates: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      total: data?.total ?? 1,
      size: data?.size ?? 1,
    },
    isPending,
    isError,
  };
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateWorkflowRequest) =>
      api.post('workflows', { json: data }).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    createWorkflow: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useCreateWorkflowViaTemplate = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateWorkflowRequest) =>
      api.post('workflows', { json: data }).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    createWorkflowViaTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetWorkflow = (workflowId?: number, enabled: boolean = true) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', workflowId],
    queryFn: () => api.get(`workflow/${workflowId}`).json<Workflow>(),
    enabled,
  });

  return {
    workflow: data,
    isPending,
    isError,
  };
};

export const useGetWorkflowTemplate = (templateId?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', templateId],
    queryFn: () => api.get(`workflow/templates/${templateId}`).json<WorkflowTemplate>(),
  });

  return {
    workflowTemplate: data,
    isPending,
    isError,
  };
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ workflowId, ...data }: UpdateWorkflowRequest) =>
      api.put(`workflows/${workflowId}`, { json: data }).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    updateWorkflow: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useUpdateWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ templateId, ...data }: UpdateWorkflowTemplateRequest) =>
      api.put(`workflows/templates/${templateId}`, { json: data }).json<WorkflowTemplate>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    updateWorkflowTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (workflowId: number) => api.delete(`workflows/${workflowId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    deleteWorkflow: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useDeleteWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (templateId: string) =>
      api.delete(`workflows/templates/${templateId}`).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    deleteWorkflowTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetWorkflowStatus = (surroWorkflowId?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', 'status', surroWorkflowId],
    queryFn: () => api.get(`workflows/${surroWorkflowId}/status`).json<string>(),
  });

  return {
    workflowStatus: data,
    isPending,
    isError,
  };
};

export const useGetWorkflowModels = (surroWorkflowId?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['workflows', 'models', surroWorkflowId],
    queryFn: () => api.get<Page<WorkflowModel>>(`workflows/${surroWorkflowId}/models`).json(),
  });

  return {
    workflowModels: data?.data ?? [],
    page: {
      number: data?.page ?? 1,
      total: data?.total ?? 1,
      size: data?.size ?? 1,
    },
    isPending,
    isError,
  };
};

export const useFinalizeWorkflowDeletion = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: { surro_workflow_id: string; run_id: string }) =>
      api
        .post(`workflows/${params.surro_workflow_id}/finalize-deletion`, {
          searchParams: params.run_id,
        })
        .json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    finalizeWorkflowDeletion: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: { surro_workflow_id: string }) =>
      api.post(`workflows/${params.surro_workflow_id}/execute`).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    executeWorkflow: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useUpdateComponentDeployStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (
      data: { surro_workflow_id: string; component_id: string } & ComponentDeployStatusBody
    ) =>
      api
        .post(
          `workflows/${data.surro_workflow_id}/components/${data.component_id}/deployment-status`,
          {
            json: data,
          }
        )
        .json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  return {
    updateComponentDeployStatus: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useTestRagWorkflow = () => {};

export const useTestMLWorkflow = () => {};

export const useCleanupWorkflow = () => {};

export const useFinalizeWorkflowCleanup = () => {};
