import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockMembers = [
  { member_id: 'user-a', name: '홍길동', email: 'a@example.com', role: 'user' },
  { member_id: 'user-b', name: '김철수', email: 'b@example.com', role: 'admin' },
];

export const memberHandlers = [
  http.get(`${BASE_URL}/members/`, () =>
    HttpResponse.json({ data: mockMembers, page: 1, size: 10, total: mockMembers.length })
  ),
  http.get(`${BASE_URL}/members/:memberId`, () => HttpResponse.json(mockMembers[0])),
  http.post(`${BASE_URL}/members/`, () => HttpResponse.json(mockMembers[0])),
  http.put(`${BASE_URL}/members/:memberId`, () => HttpResponse.json(mockMembers[0])),
  http.patch(`${BASE_URL}/members/:memberId/status`, () => HttpResponse.json(mockMembers[0])),
  http.delete(`${BASE_URL}/members/:memberId`, () => HttpResponse.json('deleted')),
];
