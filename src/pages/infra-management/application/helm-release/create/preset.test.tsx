import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { render, screen } from '@/test/utils/test-utils';
import HelmReleaseCreatePage from './page';

const renderAt = (search: string) =>
  render(<HelmReleaseCreatePage />, { route: `/create${search}` });

describe('헬름 릴리즈 생성 — 카탈로그에서 넘어온 값', () => {
  it('저장소와 차트를 미리 고른다', async () => {
    /*
     * 목록에서 차트를 눌러 왔는데 화면이 비어 있으면 무엇을 눌렀는지 잃는다. 첫 저장소가
     * 기본으로 잡히면 엉뚱한 저장소에서 차트를 찾게 된다.
     */
    server.use(
      http.get(`${BASE_URL}/any-cloud/helm-repos`, () =>
        HttpResponse.json({ data: [{ name: 'first-repo' }, { name: 'target-repo' }] })
      ),
      http.get(`${BASE_URL}/any-cloud/catalog/target-repo`, () =>
        HttpResponse.json({ data: { charts: [{ name: 'redis' }, { name: 'nginx' }] } })
      ),
      http.get(`${BASE_URL}/any-cloud/catalog/first-repo`, () =>
        HttpResponse.json({ data: { charts: [] } })
      ),
      http.get(`${BASE_URL}/any-cloud/clusters`, () => HttpResponse.json({ data: [] }))
    );

    renderAt('?repository=target-repo&chart=nginx');

    expect(await screen.findByText('target-repo')).toBeInTheDocument();
    expect(await screen.findByText('nginx')).toBeInTheDocument();
  });
});
