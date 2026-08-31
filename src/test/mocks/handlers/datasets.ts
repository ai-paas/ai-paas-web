import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockDatasets = [
  { id: 1, name: '분류 데이터셋', description: '텍스트 분류용' },
  { id: 2, name: '요약 데이터셋', description: '문서 요약용' },
];

export const mockDatasetKinds = [
  { id: 1, name: 'classification' },
  { id: 2, name: 'summarization' },
];

export const datasetHandlers = [
  // 정적 경로를 :datasetId 매칭보다 먼저 등록한다 (MSW는 배열 순서로 매칭)
  http.get(`${BASE_URL}/datasets/kinds`, () => HttpResponse.json(mockDatasetKinds)),
  http.get(`${BASE_URL}/datasets`, () =>
    HttpResponse.json({ data: mockDatasets, page: 1, size: 10, total: mockDatasets.length })
  ),
  http.get(`${BASE_URL}/datasets/:datasetId`, () => HttpResponse.json(mockDatasets[0])),
  http.post(`${BASE_URL}/datasets/validate`, () =>
    HttpResponse.json({ is_valid: true, message: 'OK' })
  ),
  http.post(`${BASE_URL}/datasets`, () => HttpResponse.json({ id: 99, name: '새 데이터셋' })),
  http.put(`${BASE_URL}/datasets/:datasetId`, () => HttpResponse.json(mockDatasets[0])),
  http.delete(`${BASE_URL}/datasets/:datasetId`, () => HttpResponse.json('deleted')),
];
