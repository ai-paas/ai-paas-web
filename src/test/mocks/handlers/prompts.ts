import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockPrompts = [
  {
    surro_prompt_id: 301,
    name: '기본 프롬프트',
    description: '기본 설명',
    content: '너는 친절한 비서다.',
  },
];

export const mockPromptVariableTypes = { available_types: ['context', 'query'] };

export const promptHandlers = [
  http.get(`${BASE_URL}/prompts`, () =>
    HttpResponse.json({ data: mockPrompts, page: 1, size: 100, total: mockPrompts.length })
  ),
  http.post(`${BASE_URL}/prompts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ surro_prompt_id: 999, ...body }, { status: 201 });
  }),
  // 정적 경로를 :surroPromptId 매칭보다 먼저 등록한다 (MSW는 배열 순서로 매칭)
  http.get(`${BASE_URL}/prompts/variable-types`, () =>
    HttpResponse.json(mockPromptVariableTypes)
  ),
  http.get(`${BASE_URL}/prompts/:surroPromptId`, ({ params }) =>
    HttpResponse.json({ ...mockPrompts[0], surro_prompt_id: Number(params.surroPromptId) })
  ),
  http.put(`${BASE_URL}/prompts/:surroPromptId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...mockPrompts[0],
      surro_prompt_id: Number(params.surroPromptId),
      ...body,
    });
  }),
  http.delete(`${BASE_URL}/prompts/:surroPromptId`, () => HttpResponse.json('deleted')),
];
