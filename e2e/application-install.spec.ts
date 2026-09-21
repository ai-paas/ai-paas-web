import { test, expect, type Page, type Route } from '@playwright/test';
import { mockApi } from './support/api-mocks';

/**
 * 설치, 업그레이드 폼은 모달이라 jsdom 단위 테스트로는 렌더를 확인하기 어렵다.
 * 실브라우저에서 "무엇을 설치 중인지" 와 선택 상자 값이 제대로 보이는지 본다.
 */

const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

const CHART = { name: 'alertmanager', version: '2.0.0', appVersion: 'v0.34.1', description: '알림 처리' };

/** any-cloud 경로는 스모크 목이 모르는 영역이라 이 spec 에서 따로 채운다. */
async function mockAnyCloud(page: Page, options: { installed?: boolean } = {}) {
  const requests: { method: string; path: string; body: unknown }[] = [];

  await page.route('**/api/v1/any-cloud/**', async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1\/any-cloud/, '');
    requests.push({ method, path, body: request.postDataJSON?.() ?? null });

    if (method === 'GET' && path === '/helm-repos') {
      return json(route, { data: [{ name: 'prometheus-community', url: 'https://example.com' }] });
    }
    if (method === 'GET' && path === '/catalog/prometheus-community') {
      return json(route, { data: { charts: [CHART] } });
    }
    if (method === 'GET' && path.endsWith('/detail')) {
      return json(route, { data: { ...CHART, repositoryName: 'prometheus-community', chartName: 'alertmanager', created: '2026-09-18T18:55:17Z', versionHistory: [{ version: '2.0.0', appVersion: 'v0.34.1', created: '2026-09-18T18:55:17Z' }] } });
    }
    if (method === 'GET' && path.endsWith('/readme')) return json(route, { data: { content: '# readme' } });
    if (method === 'GET' && path.endsWith('/values')) return json(route, { data: { content: 'replicaCount: 1\n' } });
    if (method === 'GET' && path === '/clusters') {
      // 응답에 id 가 없다 — 옵션 값을 id 로 만들면 전부 빈 값이 된다.
      return json(route, { data: [{ clusterName: 'app-os-01', status: 'READY' }] });
    }
    if (method === 'GET' && path.includes('/namespaces')) {
      return json(route, { data: [{ metadata: { name: 'default' } }, { metadata: { name: 'monitoring' } }] });
    }
    const releases = options.installed
      ? [{ name: 'alertmanager', namespace: 'monitoring', chart: 'alertmanager', chartVersion: '2.0.0', revision: '1', status: 'deployed' }]
      : [];
    // 목록은 /catalog/releases, 상세 경로는 /clusters/{n}/helm-releases 로 갈린다.
    if (method === 'GET' && path === '/catalog/releases') {
      return json(route, { data: releases, total: releases.length });
    }
    if (method === 'GET' && path.includes('/helm-releases')) {
      return json(route, { data: { releases } });
    }
    if (method === 'POST' && path.includes('/helm-releases')) {
      return json(route, { id: 'op-1', state: 'PENDING' });
    }
    return json(route, { data: [] });
  });

  return requests;
}

async function login(page: Page) {
  const api = await mockApi(page);
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill('e2e-user');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill('e2e-password');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/service$/);
  // 이후 전체 로드에서도 세션이 유지되게 한다.
  api.setLoggedIn(true);
}

test('차트 상세에서 설치 — 고른 차트를 다시 묻지 않는다', async ({ page }) => {
  await login(page);
  const requests = await mockAnyCloud(page);

  await page.goto('/infra-management/application/catalog/alertmanager?repository=prometheus-community');
  await page.getByRole('button', { name: '배포' }).click();

  // 저장소, 차트, 버전은 이미 정해져 있다 — 폼이 되묻지 않는다.
  await expect(page.getByTestId('install-target')).toContainText('prometheus-community / alertmanager');
  await expect(page.getByTestId('install-target')).toContainText('v2.0.0');

  // 클러스터 응답에 id 가 없어도 "(삭제된 옵션)" 이 되면 안 된다.
  await expect(page.getByText('삭제된 옵션')).toHaveCount(0);

  /*
   * 선택 상자 조작까지는 여기서 다루지 않는다 — UI 라이브러리의 select 가 label 을 두 겹으로
   * 감싸 locator 가 불안정하다. 제출 경로는 실 백엔드 e2e 에서 확인한다.
   */
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('클러스터를 선택하세요')).toBeVisible();
  await expect(dialog.getByText('클러스터를 먼저 고르세요')).toBeVisible();
});

test('카탈로그 목록 — 설치된 차트에 배지가 붙는다', async ({ page }) => {
  await login(page);
  await mockAnyCloud(page, { installed: true });

  await page.goto('/infra-management/application/catalog?repository=prometheus-community&clusterId=app-os-01');

  await expect(page.getByText('앱 v0.34.1')).toBeVisible();
  await expect(page.getByTestId('installed-badge')).toBeVisible();
});
