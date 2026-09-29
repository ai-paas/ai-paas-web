import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { render, screen } from '@/test/utils/test-utils';
import CatalogPage from './page';

const seed = (releases: unknown[]) => {
  server.use(
    http.get(`${BASE_URL}/any-cloud/helm-repos`, () =>
      HttpResponse.json({ data: [{ name: 'prometheus-community' }] })
    ),
    http.get(`${BASE_URL}/any-cloud/catalog/prometheus-community`, () =>
      HttpResponse.json({
        data: {
          charts: [
            { name: 'alertmanager', version: '2.0.0', appVersion: 'v0.34.1' },
            { name: 'jiralert', version: '1.0.0', appVersion: 'v1.3.0' },
          ],
        },
      })
    ),
    http.get(`${BASE_URL}/any-cloud/clusters/:name/helm-releases`, () =>
      HttpResponse.json({ data: { releases } })
    ),
    http.get(`${BASE_URL}/any-cloud/helm-releases`, () => HttpResponse.json({ data: releases }))
  );
};

describe('카탈로그 카드', () => {
  it('앱 버전을 함께 보여준다', async () => {
    // 차트 버전과 앱 버전은 다르다 — 무엇이 깔리는지는 앱 버전이 말한다.
    seed([]);
    render(<CatalogPage />, { route: '/catalog?repository=prometheus-community' });

    expect(await screen.findByText('앱 v0.34.1')).toBeInTheDocument();
  });

  it('클러스터가 정해지지 않으면 설치 배지를 붙이지 않는다', async () => {
    seed([]);
    render(<CatalogPage />, { route: '/catalog?repository=prometheus-community' });

    await screen.findByText('alertmanager');
    expect(screen.queryByTestId('installed-badge')).not.toBeInTheDocument();
  });
});
