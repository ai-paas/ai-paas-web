import type { WorkflowNode } from '@/store/useWorkflowStore';
import type { WorkflowComponentType } from '@/types/workflow';

export const DEFAULT_LABEL: Record<WorkflowComponentType, string> = {
  START: '시작',
  MODEL: '모델',
  KNOWLEDGE_BASE: '지식베이스',
  END: '끝',
};

export const createNodeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `n${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

export const createWorkflowNodeData = (type: WorkflowComponentType): WorkflowNode['data'] => {
  switch (type) {
    case 'START':
      return {
        label: DEFAULT_LABEL[type],
        name: DEFAULT_LABEL[type],
        inputFields: [],
      };
    case 'KNOWLEDGE_BASE':
      return {
        label: DEFAULT_LABEL[type],
        name: DEFAULT_LABEL[type],
        query_variable: '',
        knowledgebase_id: '',
        top_k: 3,
      };
    case 'MODEL':
      return {
        label: DEFAULT_LABEL[type],
        name: DEFAULT_LABEL[type],
        type: 'custom',
        model_id: '',
        context: '',
        prompt_id: '',
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
      };
    case 'END':
      return {
        label: DEFAULT_LABEL[type],
        name: DEFAULT_LABEL[type],
        output_variable: [],
      };
  }
};
