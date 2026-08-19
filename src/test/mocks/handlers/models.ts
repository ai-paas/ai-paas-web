import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

// 커스텀 모델과 카탈로그 모델의 id가 겹치지 않게 구성한다
// (model-setting의 모델 유형 역추론이 목록 소속으로 판별하므로).
export const mockCustomModels = [
  { id: 11, name: '커스텀 모델 A' },
  { id: 12, name: '커스텀 모델 B' },
];

export const mockModelCatalogs = [
  { id: 21, name: '카탈로그 모델 A' },
  { id: 22, name: '카탈로그 모델 B' },
];

const toPage = <T>(data: T[]) => ({ data, page: 1, size: 100, total: data.length });

export const modelHandlers = [
  http.get(`${BASE_URL}/models/custom-models`, () => HttpResponse.json(toPage(mockCustomModels))),
  http.get(`${BASE_URL}/models/model-catalog`, () => HttpResponse.json(toPage(mockModelCatalogs))),
];
