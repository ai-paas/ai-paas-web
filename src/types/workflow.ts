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

export interface WorkflowTemplate {}

export interface GetWorkflowComponentTypes {
  data: {
    type: WorkflowComponentType;
    component_id: WorkflowComponentType;
    name: string;
    description: string;
  }[];
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  category?: string;
  service_id?: string;
  workflow_definition: {
    components: {
      name: string;
      type: WorkflowComponentType;
      model_id?: number;
      knowledge_base_id?: number;
      prompt_id?: number;
    }[];
    connections: {
      source_component_type: string;
      target_component_type: string;
    }[];
  };
}

export interface UpdateWorkflowRequest extends CreateWorkflowRequest {
  workflowId: string;
  status: string;
}

export interface UpdateWorkflowTemplateRequest {
  templateId: string;
  name?: string;
  description?: string;
  category?: string;
  status?: WorkflowTemplateStatus;
  service_id: string;
  workflow_definition: {
    components: {
      name: string;
      type: WorkflowComponentType;
      model_id?: number;
      knowledge_base_id?: number;
      prompt_id?: number;
    }[];
    connections: {
      source_component_type: string;
      target_component_type: string;
    }[];
  };
}

export interface WorkflowModel {}

export interface ComponentDeployStatusBody {
  service_name: string;
  service_hostname: string;
  model_name: string;
  status: string;
  internal_url?: string;
  error_message?: string;
}
