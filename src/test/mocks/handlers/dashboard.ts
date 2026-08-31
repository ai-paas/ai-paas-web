import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

const ADMIN = `${BASE_URL}/admin/dashboard`;
const ME = `${BASE_URL}/me/dashboard`;

const emptyPage = { data: [], page: 1, size: 20, total: 0 };

export const dashboardHandlers = [
  // ── admin/dashboard ──
  http.get(`${ADMIN}/summary`, () => HttpResponse.json({ members: { total: 1 } })),
  http.get(`${ADMIN}/users/top`, () =>
    HttpResponse.json({ domain: 'services', items: [{ member_id: 'user-a', name: '홍길동', count: 3 }] })
  ),
  http.get(`${ADMIN}/infra/status`, () => HttpResponse.json({ clusters: [], has_data: false })),
  http.get(`${ADMIN}/infra/nodes`, () =>
    HttpResponse.json({ cluster: { name: 'cluster-a' }, nodes: [] })
  ),
  http.get(`${ADMIN}/infra/resources`, () =>
    HttpResponse.json({ cluster: { name: 'cluster-a' }, resource_type: 'cpu', nodes: [] })
  ),
  http.get(`${ADMIN}/events`, () => HttpResponse.json(emptyPage)),
  http.get(`${ADMIN}/trends`, () => HttpResponse.json({ series: [] })),
  http.post(`${ADMIN}/trends/refresh`, () => HttpResponse.json({ refreshed: true })),
  http.get(`${ADMIN}/api-metrics`, () => HttpResponse.json({ paths: [], buckets_ms: [] })),
  http.post(`${ADMIN}/api-metrics/flush`, () => HttpResponse.json({ flushed: 0 })),
  http.get(`${ADMIN}/providers/health`, () => HttpResponse.json({ providers: [], history: {} })),
  http.post(`${ADMIN}/providers/health/probe`, () =>
    HttpResponse.json({ providers: [], history: {} })
  ),

  // ── me/dashboard ──
  http.get(`${ME}/summary`, () => HttpResponse.json({ services: { total: 1 } })),
  http.get(`${ME}/services`, () => HttpResponse.json({ services: [], source: 'live' })),
  http.get(`${ME}/monitoring`, () => HttpResponse.json({ services: [], top: {}, source: 'live' })),
  http.get(`${ME}/activities`, () => HttpResponse.json(emptyPage)),
];
