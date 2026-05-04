import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import type { WorkflowComponentType, WorkflowDefinition } from '@/types/workflow';

const TOP_LEVEL_KEYS = new Set([
  'label',
  'name',
  'description',
  'model_id',
  'knowledgebase_id',
  'prompt_id',
]);

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const buildWorkflowDefinition = (
  nodes: WorkflowNode[],
  edges: Edge[]
): WorkflowDefinition => {
  const components = nodes.map((node) => {
    const type = node.type as WorkflowComponentType;
    const data = node.data as Record<string, unknown>;
    const allowsConfig = type !== 'START' && type !== 'END';
    const config = allowsConfig
      ? Object.fromEntries(Object.entries(data).filter(([key]) => !TOP_LEVEL_KEYS.has(key)))
      : {};

    return {
      ref_id: node.id,
      name: typeof data.name === 'string' && data.name ? data.name : node.id,
      type,
      description: typeof data.description === 'string' ? data.description : undefined,
      model_id: toNumberOrUndefined(data.model_id),
      knowledge_base_id: toNumberOrUndefined(data.knowledgebase_id),
      prompt_id: toNumberOrUndefined(data.prompt_id),
      config: allowsConfig && Object.keys(config).length > 0 ? config : undefined,
    };
  });

  const connections = edges.map((edge) => ({
    source_ref_id: edge.source,
    target_ref_id: edge.target,
  }));

  return { components, connections };
};
