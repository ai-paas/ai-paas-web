import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockPrompts = [
  { surro_prompt_id: 301, name: '기본 프롬프트', content: '너는 친절한 비서다.' },
];

export const promptHandlers = [
  http.get(`${BASE_URL}/prompts`, () =>
    HttpResponse.json({ data: mockPrompts, page: 1, size: 100, total: mockPrompts.length })
  ),
];
