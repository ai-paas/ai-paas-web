type WorkflowTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ERROR';
export type WorkflowComponentType = 'START' | 'END' | 'MODEL' | 'KNOWLEDGE_BASE';

export interface Workflow {
  id: number;
  surro_workflow_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  name: string;
  description: string;
  category: string;
  status: string;
  service_id: string;
  is_template: boolean;
  template_id: string;
}

export type WorkflowTemplate = Workflow;

export interface GetWorkflowComponentTypes {
  data: {
    type: WorkflowComponentType;
    component_id: WorkflowComponentType;
    name: string;
    description: string;
  }[];
}

export interface WorkflowComponentDefinition {
  ref_id: string;
  name: string;
  type: WorkflowComponentType;
  description?: string;
  model_id?: number;
  knowledge_base_id?: number;
  prompt_id?: number;
  config?: Record<string, unknown>;
}

export interface WorkflowConnectionDefinition {
  source_ref_id: string;
  target_ref_id: string;
}

export interface WorkflowDefinition {
  components: WorkflowComponentDefinition[];
  connections: WorkflowConnectionDefinition[];
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  category?: string;
  service_id?: string;
  workflow_definition?: WorkflowDefinition;
}

export interface ValidateWorkflowRequest {
  workflow_definition: WorkflowDefinition;
}

export interface ValidationCheck {
  rule: string;
  passed: boolean;
  message?: string | null;
}

export interface ValidateWorkflowResponse {
  valid: boolean;
  checks: ValidationCheck[];
}

export interface UpdateWorkflowRequest {
  workflowId: string;
  name?: string;
  description?: string;
  category?: string;
  status?: WorkflowTemplateStatus;
  service_id?: string;
  workflow_definition?: WorkflowDefinition;
}

export interface UpdateWorkflowTemplateRequest {
  templateId: string;
  name?: string;
  description?: string;
  category?: string;
  status?: WorkflowTemplateStatus;
  workflow_definition?: WorkflowDefinition;
}

export type WorkflowModel = Record<string, unknown>;

export interface ComponentDeployStatusBody {
  service_name: string;
  service_hostname: string;
  model_name: string;
  status: string;
  internal_url?: string;
  error_message?: string;
}
