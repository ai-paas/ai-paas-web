import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockLearnings = [
  { id: 31, name: '분류 학습 A', status: 'RUNNING' },
  { id: 32, name: '요약 학습 B', status: 'DONE' },
];

export const learningHandlers = [
  // 정적 경로를 :experimentId 매칭보다 먼저 등록한다 (MSW는 배열 순서로 매칭)
  http.post(`${BASE_URL}/learning/training`, () => HttpResponse.json({ experiment_id: 99 })),
  http.post(`${BASE_URL}/learning/model/registration`, () =>
    HttpResponse.json({ accepted: true, experiment_id: 31, message: '등록 요청 접수' })
  ),
  http.get(`${BASE_URL}/learning`, () =>
    HttpResponse.json({ data: mockLearnings, page: 1, size: 10, total: mockLearnings.length })
  ),
  http.get(`${BASE_URL}/learning/:experimentId/status`, () =>
    HttpResponse.json({ status: 'RUNNING' })
  ),
  http.get(`${BASE_URL}/learning/:experimentId`, () => HttpResponse.json(mockLearnings[0])),
  http.patch(`${BASE_URL}/learning/:experimentId/internal-access`, () =>
    HttpResponse.json(mockLearnings[0])
  ),
  http.patch(`${BASE_URL}/learning/:experimentId`, () => HttpResponse.json(mockLearnings[0])),
  http.delete(`${BASE_URL}/learning/:experimentId`, () => HttpResponse.json('deleted')),
];
