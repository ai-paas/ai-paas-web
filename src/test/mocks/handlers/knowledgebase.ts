import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

const toPage = <T>(data: T[]) => ({ data, page: 1, size: 10, total: data.length });

export const mockKnowledgeBase = {
  id: 7,
  surro_knowledge_id: 101,
  name: '사내 규정 문서',
  description: '2026년 개정판',
  collection_name: 'kb-101',
  chunk_size: 500,
  chunk_overlap: 50,
  top_k: 3,
  threshold: 0.4,
  embedding_model_id: 13,
  language_id: 1,
  chunk_type_id: 1,
  search_method_id: 1,
  created_at: '2026-08-19T00:00:00Z',
  updated_at: '2026-08-19T00:00:00Z',
  created_by: 'tester',
  files: [],
};

export const knowledgebaseHandlers = [
  // 정적 경로를 :id 매칭보다 먼저 등록한다 (MSW는 배열 순서로 매칭)
  http.get(`${BASE_URL}/knowledge-bases/chunk-types`, () =>
    HttpResponse.json(toPage([{ id: 1, name: 'sentence' }]))
  ),
  http.get(`${BASE_URL}/knowledge-bases/languages`, () =>
    HttpResponse.json(toPage([{ id: 1, name: '한국어' }]))
  ),
  http.get(`${BASE_URL}/knowledge-bases/search-methods`, () =>
    HttpResponse.json(toPage([{ id: 1, name: 'dense' }]))
  ),
  http.get(`${BASE_URL}/knowledge-bases`, () => HttpResponse.json(toPage([mockKnowledgeBase]))),
  http.get(`${BASE_URL}/knowledge-bases/:id/search-records`, () =>
    HttpResponse.json([
      { id: 1, knowledge_base_id: 101, source: 'kb-101', text: '휴가 규정', created_at: '2026-08-19T00:00:00Z' },
    ])
  ),
  http.get(`${BASE_URL}/knowledge-bases/:id`, () => HttpResponse.json(mockKnowledgeBase)),
  http.post(`${BASE_URL}/knowledge-bases/:id/search`, () =>
    HttpResponse.json({
      results: [{ text: '연차는 15일이다', score: 0.92 }],
      total: 1,
      search_method: 'dense',
    })
  ),
  http.post(`${BASE_URL}/knowledge-bases/:id/files`, () => HttpResponse.json(mockKnowledgeBase)),
  http.post(`${BASE_URL}/knowledge-bases`, () => HttpResponse.json(mockKnowledgeBase)),
  http.put(`${BASE_URL}/knowledge-bases/:id`, () => HttpResponse.json(mockKnowledgeBase)),
  http.delete(`${BASE_URL}/knowledge-bases/:id/files/:fileId`, () =>
    HttpResponse.json(mockKnowledgeBase)
  ),
  http.delete(`${BASE_URL}/knowledge-bases/:id`, () => HttpResponse.json('deleted')),
];
