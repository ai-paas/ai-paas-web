import { http, HttpResponse } from 'msw';
import type {
  Service,
  ServiceDetail,
  CreateServiceRequest,
} from '@/types/service';
import type { Page } from '@/types/api';

const BASE_URL = 'http://localhost:3000/api/v1';

// 테스트용 목 데이터
export const mockServices: Service[] = [
  {
    id: 1,
    name: '테스트 서비스 1',
    description: '테스트 설명 1',
    tags: ['tag1', 'tag2'],
    created_by: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    surro_service_id: 'srv-001',
  },
  {
    id: 2,
    name: '테스트 서비스 2',
    description: '테스트 설명 2',
    tags: ['tag3'],
    created_by: 'user2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    surro_service_id: 'srv-002',
  },
];

export const mockServiceDetail: ServiceDetail = {
  ...mockServices[0],
  workflow_count: 2,
  workflows: [],
  monitoring_data: {
    total_metrics: {
      message_count: 100,
      active_users: 10,
      token_usage: 5000,
      avg_interaction_count: 5,
      response_time_ms: 200,
      error_count: 2,
      success_rate: 98,
    },
    workflow_metrics: [],
    period_start: new Date('2024-01-01'),
    period_end: new Date('2024-01-31'),
  },
};

export const handlers = [
  // GET /services - 서비스 목록 조회
  http.get(`${BASE_URL}/services`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const size = Number(url.searchParams.get('size')) || 10;

    const response: Page<Service> = {
      data: mockServices,
      total: mockServices.length,
      page,
      size,
    };
    return HttpResponse.json(response);
  }),

  // POST /services - 서비스 생성
  http.post(`${BASE_URL}/services`, async ({ request }) => {
    const body = (await request.json()) as CreateServiceRequest;
    const newService: Service = {
      id: Date.now(),
      name: body.name,
      description: body.description,
      tags: body.tags,
      created_by: 'test-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      surro_service_id: `srv-${Date.now()}`,
    };
    return HttpResponse.json(newService, { status: 201 });
  }),

  // GET /services/:id - 단일 서비스 조회
  http.get(`${BASE_URL}/services/:surro_service_id`, ({ params }) => {
    const { surro_service_id } = params;
    if (surro_service_id === 'srv-001') {
      return HttpResponse.json(mockServiceDetail);
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // PUT /services/:id - 서비스 수정
  http.put(
    `${BASE_URL}/services/:surro_service_id`,
    async ({ params, request }) => {
      const { surro_service_id } = params;
      const body = (await request.json()) as CreateServiceRequest;
      const updatedService: Service = {
        ...mockServices[0],
        surro_service_id: surro_service_id as string,
        name: body.name,
        description: body.description,
        tags: body.tags,
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(updatedService);
    }
  ),

  // DELETE /services/:id - 서비스 삭제
  http.delete(`${BASE_URL}/services/:surro_service_id`, () => {
    return HttpResponse.json('deleted');
  }),
];
