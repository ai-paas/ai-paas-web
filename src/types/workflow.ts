export type WorkflowType = 'start' | 'model' | 'knowledgebase' | 'end';

export interface Workflow {
  name: string;
  description: string;
  id: number;
  workflow_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  parameters: object;
}

export interface UpdateWorkflowRequest extends CreateWorkflowRequest {
  workflowId: string;
  status: string;
}
