import { api } from '@/lib/api';
import { queryKeys, type WorkflowListParams } from '@/lib/query-keys';
import type { Page } from '@/types/api';
import type {
  CloneWorkflowTemplateRequest,
  ClonedWorkflow,
  CleanupWorkflowResponse,
  ComponentDeployStatusBody,
  CreateWorkflowTemplateRequest,
  CreateWorkflowRequest,
  DeleteWorkflowResponse,
  ExecuteWorkflowResponse,
  FinalizeWorkflowCleanupResponse,
  FinalizeWorkflowDeletionResponse,
  GetWorkflowComponentTypes,
  UpdateWorkflowRequest,
  UpdateWorkflowTemplateRequest,
  ValidateWorkflowRequest,
  ValidateWorkflowResponse,
  Workflow,
  WorkflowRead,
  WorkflowModelsResponse,
  WorkflowMlTestResponse,
  WorkflowRagTestResponse,
  WorkflowStatusResponse,
  WorkflowTemplate,
  WorkflowTemplateListParams,
  WorkflowTemplateListResponse,
} from '@/types/workflow';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { HTTPError } from 'ky';

export const useGetWorkflows = (params: WorkflowListParams) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.workflows.list(params),
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
    queryKey: queryKeys.workflows.componentTypes(),
    queryFn: () => api.get<GetWorkflowComponentTypes>('workflows/component-types').json(),
  });

  return {
    workflowComponentTypes: data?.data ?? [],
    isPending,
    isError,
  };
};

export const useGetTemplates = (params: WorkflowTemplateListParams = {}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.workflows.templates(params),
    queryFn: () =>
      api
        .get<WorkflowTemplateListResponse>('workflows/templates', { searchParams: { ...params } })
        .json(),
  });

  const workflowTemplates = data?.items ?? [];

  return {
    workflowTemplates,
    page: {
      number: params.page ?? 1,
      total: data?.total ?? 0,
      size: params.size ?? workflowTemplates.length,
    },
    isPending,
    isError,
  };
};

export const useValidateWorkflow = () => {
  const { mutate, isPending, isError, isSuccess, data, reset } = useMutation({
    mutationFn: (data: ValidateWorkflowRequest) =>
      api.post('workflows/validate', { json: data }).json<ValidateWorkflowResponse>(),
  });

  return {
    validateWorkflow: mutate,
    validation: data,
    isPending,
    isError,
    isSuccess,
    reset,
  };
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateWorkflowRequest) =>
      api.post('workflows', { json: data }).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    createWorkflowViaTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useGetWorkflow = (workflowId?: number | string, enabled: boolean = true) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.workflows.detail(workflowId),
    queryFn: () => api.get(`workflows/${workflowId}`).json<WorkflowRead>(),
    enabled: enabled && !!workflowId,
  });

  return {
    workflow: data,
    isPending,
    isError,
  };
};

export const useGetWorkflowTemplate = (templateId?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.workflows.detail(templateId),
    queryFn: () => api.get(`workflows/templates/${templateId}`).json<WorkflowTemplate>(),
    enabled: !!templateId,
  });

  return {
    workflowTemplate: data,
    isPending,
    isError,
  };
};

export const useCreateWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CreateWorkflowTemplateRequest) =>
      api.post('workflows/templates', { json: data }).json<string>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    createWorkflowTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useCloneWorkflowTemplate = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ templateId, workflow_name, service_id }: CloneWorkflowTemplateRequest) => {
      const searchParams: Record<string, string | number> = { workflow_name };

      if (service_id !== undefined) {
        searchParams.service_id = service_id;
      }

      return api
        .post(`workflows/templates/${templateId}/clone`, { searchParams })
        .json<ClonedWorkflow>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    cloneWorkflowTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: ({ workflowId, ...data }: UpdateWorkflowRequest) =>
      api.put(`workflows/${workflowId}`, { json: data }).json<Workflow>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
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
    mutationFn: (workflowId: string) =>
      api.delete(`workflows/${workflowId}`).json<DeleteWorkflowResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    deleteWorkflowTemplate: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

const isWorkflowDeploying = (data?: WorkflowStatusResponse) => {
  const models = data?.deployed_models ?? [];

  return models.some((model) => model.status === 'PENDING' || model.status === 'DEPLOYING');
};

export const useGetWorkflowStatus = (
  surroWorkflowId?: string,
  { enabled = true, polling = false }: { enabled?: boolean; polling?: boolean } = {}
) => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.workflows.status(surroWorkflowId),
    queryFn: () => api.get(`workflows/${surroWorkflowId}/status`).json<WorkflowStatusResponse>(),
    enabled: enabled && !!surroWorkflowId,
    refetchInterval: polling
      ? (query) => (isWorkflowDeploying(query.state.data) ? 7000 : false)
      : false,
  });

  return {
    workflowStatus: data,
    isDeploying: isWorkflowDeploying(data),
    isPending,
    isError,
    refetch,
  };
};

export const useGetWorkflowModels = (surroWorkflowId?: string) => {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.workflows.models(surroWorkflowId),
    queryFn: () => api.get<WorkflowModelsResponse>(`workflows/${surroWorkflowId}/models`).json(),
    enabled: !!surroWorkflowId,
  });

  return {
    workflowModels: data?.deployed_models ?? [],
    backendApiUrl: data?.backend_api_url ?? null,
    workflowId: data?.workflow_id,
    page: {
      number: 1,
      total: data?.total ?? 0,
      size: data?.deployed_models.length ?? 0,
    },
    isPending,
    isError,
  };
};

export const useFinalizeWorkflowDeletion = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: { surro_workflow_id: string }) =>
      api
        .post(`workflows/${params.surro_workflow_id}/finalize-deletion`)
        .json<FinalizeWorkflowDeletionResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    finalizeWorkflowDeletion: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const isExecuteTimeoutError = async (error: unknown) => {
  const httpError = error as HTTPError;

  if (httpError?.response?.status !== 500) return false;

  try {
    const body = (await httpError.response.clone().json()) as { detail?: unknown };
    return body.detail === '' || body.detail === null || body.detail === undefined;
  } catch {
    return false;
  }
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: { surro_workflow_id: string }) =>
      api.post(`workflows/${params.surro_workflow_id}/execute`).json<ExecuteWorkflowResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    updateComponentDeployStatus: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

export const useTestRagWorkflow = () => {
  const { mutate, isPending, isError, isSuccess, data } = useMutation({
    mutationFn: (params: { surro_workflow_id: string; text: string }) => {
      const formData = new FormData();
      formData.append('text', params.text);

      return api
        .post(`workflows/${params.surro_workflow_id}/test/rag`, { body: formData })
        .json<WorkflowRagTestResponse>();
    },
  });

  return {
    testRagWorkflow: mutate,
    testResult: data,
    isPending,
    isError,
    isSuccess,
  };
};

export const useTestMLWorkflow = () => {
  const { mutate, isPending, isError, isSuccess, data } = useMutation({
    mutationFn: (params: { surro_workflow_id: string; image: File }) => {
      const formData = new FormData();
      formData.append('image', params.image);

      return api
        .post(`workflows/${params.surro_workflow_id}/test/ml`, { body: formData })
        .json<WorkflowMlTestResponse>();
    },
  });

  return {
    testMLWorkflow: mutate,
    testResult: data,
    isPending,
    isError,
    isSuccess,
  };
};

export const useCleanupWorkflow = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (params: { surro_workflow_id: string }) =>
      api.post(`workflows/${params.surro_workflow_id}/cleanup`).json<CleanupWorkflowResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });

  return {
    cleanupWorkflow: mutate,
    isPending,
    isError,
    isSuccess,
  };
};

const FINALIZE_CLEANUP_POLL_INTERVAL = 3000;

/**
 * cleanup API가 반환한 run_id로 finalize-cleanup을 폴링한다.
 * status가 'in_progress'인 동안 refetchInterval로 재호출하고,
 * 'completed' 또는 'failed'가 되면 멈춘다.
 */
export const useFinalizeWorkflowCleanup = (params: {
  surro_workflow_id?: string;
  run_id?: string;
  enabled?: boolean;
}) => {
  const enabled = Boolean(params.enabled && params.surro_workflow_id && params.run_id);

  const { data, isFetching, isError } = useQuery({
    queryKey: queryKeys.workflows.finalizeCleanup(params.surro_workflow_id, params.run_id),
    queryFn: () =>
      api
        .post(`workflows/${params.surro_workflow_id}/finalize-cleanup`, {
          searchParams: { run_id: params.run_id ?? '' },
        })
        .json<FinalizeWorkflowCleanupResponse>(),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === 'in_progress' ? FINALIZE_CLEANUP_POLL_INTERVAL : false,
    gcTime: 0,
    staleTime: 0,
  });

  return {
    status: data?.status,
    result: data,
    isPolling: isFetching || data?.status === 'in_progress',
    isError,
  };
};
