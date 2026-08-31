import { http, HttpResponse } from 'msw';
import { BASE_URL } from './base';

export const mockPod = (name: string, namespace = 'default', nodeName = 'node-1') => ({
  metadata: { name, namespace },
  spec: { nodeName },
  status: { phase: 'Running' },
});

const emptyVector = {
  status: 'success',
  data: { resultType: 'vector', result: [] },
};

const emptyMatrix = {
  status: 'success',
  data: { resultType: 'matrix', result: [] },
};

export const monitoringHandlers = [
  http.get(`${BASE_URL}/any-cloud/monit/:clusterName/query_range`, () =>
    HttpResponse.json(emptyMatrix)
  ),
  http.get(`${BASE_URL}/any-cloud/monit/:clusterName/query`, () => HttpResponse.json(emptyVector)),
  http.post(`${BASE_URL}/any-cloud/monit/:clusterName/multi-query`, () =>
    HttpResponse.json({ cpu: emptyVector })
  ),
  http.get(`${BASE_URL}/any-cloud/kubernetes/pods`, () =>
    HttpResponse.json({ data: [mockPod('pod-1')], total: 1, size: 100, total_pages: 1 })
  ),
];
