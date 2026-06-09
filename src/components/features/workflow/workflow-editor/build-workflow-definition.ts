import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import type { WorkflowComponentType, WorkflowDefinition } from '@/types/workflow';

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const buildComponentConfig = (type: WorkflowComponentType, data: Record<string, unknown>) => {
  if (type === 'MODEL') {
    return {
      temperature: toNumberOrUndefined(data.temperature),
      top_p: toNumberOrUndefined(data.top_p),
      max_tokens: toNumberOrUndefined(data.max_tokens),
    };
  }

  if (type === 'KNOWLEDGE_BASE') {
    return {
      top_k: toNumberOrUndefined(data.top_k),
    };
  }

  return {};
};

export const buildWorkflowDefinition = (
  nodes: WorkflowNode[],
  edges: Edge[]
): WorkflowDefinition => {
  const components = nodes.map((node) => {
    const type = node.type as WorkflowComponentType;
    const data = node.data as Record<string, unknown>;
    const config = Object.fromEntries(
      Object.entries(buildComponentConfig(type, data)).filter(([, value]) => value !== undefined)
    );

    return {
      ref_id: node.id,
      name: typeof data.name === 'string' && data.name ? data.name : node.id,
      type,
      description: typeof data.description === 'string' ? data.description : undefined,
      model_id: toNumberOrUndefined(data.model_id),
      knowledge_base_id: toNumberOrUndefined(data.knowledgebase_id),
      prompt_id: toNumberOrUndefined(data.prompt_id),
      config: Object.keys(config).length > 0 ? config : undefined,
      x: toNumberOrUndefined(node.position?.x),
      y: toNumberOrUndefined(node.position?.y),
    };
  });

  const connections = edges.map((edge) => ({
    source_ref_id: edge.source,
    target_ref_id: edge.target,
  }));

  return { components, connections };
};
