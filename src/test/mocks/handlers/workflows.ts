import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';
import type { UpdateWorkflowRequest, Workflow } from '@/types/workflow';

// 테스트용 목 데이터
export const mockWorkflow: Workflow = {
  id: 1,
  surro_workflow_id: 'wf-001',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user1',
  name: '테스트 워크플로우',
  description: '테스트 설명',
  category: '테스트 카테고리',
  status: 'DRAFT',
  service_id: null,
  is_template: false,
  template_id: null,
};

export const workflowHandlers = [
  // PUT /workflows/:surro_workflow_id - 워크플로우 수정 (부분 업데이트)
  http.put(`${BASE_URL}/workflows/:surro_workflow_id`, async ({ params, request }) => {
    const body = (await request.json()) as Omit<UpdateWorkflowRequest, 'workflowId'>;
    const updated: Workflow = {
      ...mockWorkflow,
      surro_workflow_id: params.surro_workflow_id as string,
      name: body.name ?? mockWorkflow.name,
      description: body.description ?? mockWorkflow.description,
      category: body.category ?? mockWorkflow.category,
      status: body.status ?? mockWorkflow.status,
      service_id: body.service_id !== undefined ? body.service_id : mockWorkflow.service_id,
      updated_at: '2024-01-02T00:00:00Z',
    };
    return HttpResponse.json(updated);
  }),
];
