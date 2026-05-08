import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import type { WorkflowComponent, WorkflowComponentType, WorkflowRead } from '@/types/workflow';

const DEFAULT_LABEL: Record<WorkflowComponentType, string> = {
  START: 'START',
  MODEL: 'MODEL',
  KNOWLEDGE_BASE: 'KNOWLEDGE_BASE',
  END: 'END',
};

const createNodeData = (component: WorkflowComponent): WorkflowNode['data'] => {
  const config = component.config ?? {};
  const baseData = {
    label: component.name || DEFAULT_LABEL[component.type],
    name: component.name || DEFAULT_LABEL[component.type],
    description: component.description ?? '',
  };

  if (component.type === 'START') {
    return {
      ...baseData,
      inputFields: [],
    };
  }

  if (component.type === 'MODEL') {
    return {
      ...baseData,
      type: 'custom' as const,
      model_id: component.model_id ? String(component.model_id) : '',
      context: '',
      prompt_id: component.prompt_id ? String(component.prompt_id) : '',
      temperature: typeof config.temperature === 'number' ? config.temperature : 0.7,
      top_p: typeof config.top_p === 'number' ? config.top_p : 0.9,
      max_tokens: typeof config.max_tokens === 'number' ? config.max_tokens : 2048,
    };
  }

  if (component.type === 'KNOWLEDGE_BASE') {
    return {
      ...baseData,
      query_variable: '',
      knowledgebase_id: component.knowledge_base_id ? String(component.knowledge_base_id) : '',
      top_k: typeof config.top_k === 'number' ? config.top_k : 3,
    };
  }

  return {
    ...baseData,
    output_variable: [],
  };
};

export const workflowToFlow = (workflow?: WorkflowRead) => {
  const components = workflow?.components ?? [];
  const componentIds = new Set(components.map((component) => component.id));

  const nodes = components.map<WorkflowNode>((component, index) => ({
    id: component.id,
    type: component.type,
    position: {
      x: index * 300,
      y: component.type === 'START' || component.type === 'END' ? 120 : 220,
    },
    data: createNodeData(component),
  }));

  const edges = (workflow?.component_connections ?? [])
    .filter(
      (connection) =>
        componentIds.has(connection.source_component_id) &&
        componentIds.has(connection.target_component_id)
    )
    .map<Edge>((connection, index) => ({
      id: connection.id ?? `e-${connection.source_component_id}-${connection.target_component_id}-${index}`,
      source: connection.source_component_id,
      target: connection.target_component_id,
    }));

  return { nodes, edges };
};
