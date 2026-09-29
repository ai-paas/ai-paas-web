import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { renderListPage } from '@/test/utils/list-page';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';
import { screen } from '@/test/utils/test-utils';
import HelmRepositoryPage from './page';

installDomMeasurementStubs();

const repos = [
  { name: 'has-charts', url: 'https://a.example.com', source: 'EXTERNAL' },
  { name: 'empty-index', url: 'https://b.example.com', source: 'EXTERNAL' },
  { name: 'broken', url: 'https://c.example.com', source: 'EXTERNAL' },
];

describe('헬름 저장소 상태', () => {
  it('차트 수, 차트 없음, 연결 실패를 가른다', async () => {
    // "등록했다" 와 "쓸 수 있다" 는 다르다. 인덱스는 읽히는데 차트가 0 개인 저장소가 있었다.
    server.use(
      http.get(`${BASE_URL}/any-cloud/helm-repos`, () => HttpResponse.json({ data: repos })),
      http.get(`${BASE_URL}/any-cloud/catalog/has-charts`, () =>
        HttpResponse.json({ data: { charts: [{ name: 'a' }, { name: 'b' }] } })
      ),
      http.get(`${BASE_URL}/any-cloud/catalog/empty-index`, () =>
        HttpResponse.json({ data: { charts: [] } })
      ),
      http.get(`${BASE_URL}/any-cloud/catalog/broken`, () => HttpResponse.error())
    );

    renderListPage(<HelmRepositoryPage />);

    expect(await screen.findByText('차트 2개')).toBeInTheDocument();
    expect(await screen.findByText('차트 없음')).toBeInTheDocument();
    expect(await screen.findByText('연결 실패')).toBeInTheDocument();
  });
});
