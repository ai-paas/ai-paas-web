import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockPrompts = [
  { surro_prompt_id: 301, name: '기본 프롬프트', content: '너는 친절한 비서다.' },
];

export const promptHandlers = [
  http.get(`${BASE_URL}/prompts`, () =>
    HttpResponse.json({ data: mockPrompts, page: 1, size: 100, total: mockPrompts.length })
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
