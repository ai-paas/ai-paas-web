import type { GetDatasetsParams } from '@/types/dataset';
import type { GetKnowledgeBasesParams, GetSearchRecordsParams } from '@/types/knowledgebase';
import type { GetMembersParams } from '@/types/member';
import type {
  GetCustomModelsParams,
  GetHubModelsParams,
  GetModelCatalogsParams,
  GetModelFormatsParams,
  GetModelProvidersParams,
  GetModelsParams,
  GetModelTypesParams,
  GetOptimizersParams,
} from '@/types/model';
import type { GetServicesParams } from '@/types/service';

export type HubModelTagParams = {
  group: 'region' | 'library' | 'task' | 'framework' | 'language';
  market: string;
};

export type WorkflowListParams = {
  page?: number;
  size?: number;
  search?: string;
  creator_id?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'ERROR';
};

export const queryKeys = {
  datasets: {
    all: ['datasets'] as const,
    list: (params: GetDatasetsParams = {}) => [...queryKeys.datasets.all, params] as const,
    detail: (datasetId?: number) => [...queryKeys.datasets.all, datasetId] as const,
  },
  knowledgeBases: {
    all: ['knowledge-bases'] as const,
    list: (params: GetKnowledgeBasesParams = {}) =>
      [...queryKeys.knowledgeBases.all, params] as const,
    detail: (knowledgeBaseId: number) =>
      [...queryKeys.knowledgeBases.all, knowledgeBaseId] as const,
    files: (knowledgeBaseId: number) =>
      [...queryKeys.knowledgeBases.detail(knowledgeBaseId), 'files'] as const,
    searchRecords: (knowledgeBaseId: number, params: GetSearchRecordsParams = {}) =>
      [...queryKeys.knowledgeBases.detail(knowledgeBaseId), 'search-records', params] as const,
  },
  knowledgeBaseMeta: {
    chunkTypes: ['chunk-types'] as const,
    languages: ['languages'] as const,
    searchMethods: ['search-methods'] as const,
  },
  members: {
    all: ['members'] as const,
    list: (params: GetMembersParams = {}) => [...queryKeys.members.all, params] as const,
    detail: (memberId?: string) => [...queryKeys.members.all, memberId] as const,
  },
  models: {
    all: ['models'] as const,
    list: (params: GetModelsParams = {}) => [...queryKeys.models.all, params] as const,
    detail: (modelId: number) => ['model', modelId] as const,
  },
  customModels: {
    all: ['custom-models'] as const,
    list: (params: GetCustomModelsParams = {}) => [...queryKeys.customModels.all, params] as const,
  },
  modelCatalogs: {
    all: ['model-catalogs'] as const,
    list: (params: GetModelCatalogsParams = {}) =>
      [...queryKeys.modelCatalogs.all, params] as const,
  },
  modelProviders: {
    all: ['providers'] as const,
    list: (params: GetModelProvidersParams = {}) =>
      [...queryKeys.modelProviders.all, params] as const,
  },
  modelTypes: {
    all: ['model-types'] as const,
    list: (params: GetModelTypesParams = {}) => [...queryKeys.modelTypes.all, params] as const,
  },
  modelFormats: {
    all: ['model-formats'] as const,
    list: (params: GetModelFormatsParams = {}) => [...queryKeys.modelFormats.all, params] as const,
  },
  hubModels: {
    all: ['hub-connect'] as const,
    list: (params: GetHubModelsParams) => [...queryKeys.hubModels.all, params] as const,
  },
  hubModelTags: {
    all: ['hub-connect-tags'] as const,
    list: (params: HubModelTagParams) => [...queryKeys.hubModelTags.all, params] as const,
  },
  modelForOptimizer: {
    all: ['modelForOptimizer'] as const,
    detail: (modelId?: number) => [...queryKeys.modelForOptimizer.all, modelId] as const,
  },
  optimizers: {
    all: ['optimizers'] as const,
    list: (params: GetOptimizersParams) => [...queryKeys.optimizers.all, params] as const,
  },
  prompts: {
    all: ['prompts'] as const,
    detail: (promptId: number) => ['prompt', promptId] as const,
  },
  services: {
    all: ['services'] as const,
    list: (params: GetServicesParams = {}) => [...queryKeys.services.all, params] as const,
    detail: (serviceId?: string) => [...queryKeys.services.all, serviceId] as const,
  },
  workflows: {
    all: ['workflows'] as const,
    list: (params: WorkflowListParams) => [...queryKeys.workflows.all, params] as const,
    detail: (workflowId?: number | string) => [...queryKeys.workflows.all, workflowId] as const,
    componentTypes: () => [...queryKeys.workflows.all, 'component-types'] as const,
    templates: () => [...queryKeys.workflows.all, 'templates'] as const,
    status: (workflowId?: string) => [...queryKeys.workflows.all, 'status', workflowId] as const,
    models: (workflowId?: string) => [...queryKeys.workflows.all, 'models', workflowId] as const,
  },
};
