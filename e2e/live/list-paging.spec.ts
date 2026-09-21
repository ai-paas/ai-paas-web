import { test, expect, type Page } from '@playwright/test';

/**
 * 목록이 서버 페이지를 쓰는지 본다.
 *
 * <p>화면이 page/size 를 보내지 않으면 게이트웨이 기본값(20건)으로 잘려 21번째부터를 영영
 * 보지 못한다. 자원은 만들지 않고 목록 응답만 가로채 확인한다.
 */

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill(process.env.E2E_MEMBER_ID ?? '');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

const node = (index: number) => ({
  nodeName: `node-${index}`,
  clusterName: `cluster-${index}`,
  clusterProvider: 'AWS',
  role: index % 2 === 0 ? 'master' : 'worker',
  region: 'ap-northeast-2',
});

test.describe('목록 페이지네이션', () => {
  test.skip(process.env.E2E_LIVE !== '1', '실제 자격증명이 필요해 기본 실행에서 제외한다');
  test.describe.configure({ timeout: 180_000 });

  test('페이지를 넘기면 서버에 그 페이지를 요청한다', async ({ page }) => {
    await login(page);

    const requested: Array<{ page: string | null; size: string | null }> = [];
    await page.route(/\/any-cloud\/nodes(\?|$)/, async (route) => {
      const url = new URL(route.request().url());
      const requestedPage = url.searchParams.get('page');
      const requestedSize = url.searchParams.get('size');
      requested.push({ page: requestedPage, size: requestedSize });

      const size = Number(requestedSize ?? '20');
      const index = Number(requestedPage ?? '1');
      // 전체 57건 중 이 페이지만 돌려준다. 화면이 전량을 받아 자르면 이 값이 맞지 않는다.
      const start = (index - 1) * size;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: Array.from({ length: Math.min(size, Math.max(0, 57 - start)) }, (_, i) => node(start + i)),
          total: 57,
          page: index,
          size,
          has_next: start + size < 57,
        }),
      });
    });
    await page.route(/\/any-cloud\/vms(\?|$)/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0, page: 1, size: 100, has_next: false }),
      })
    );

    await page.goto('/infra-management/vm');
    await expect(page.getByText('node-0')).toBeVisible({ timeout: 60_000 });

    expect(requested[0].page, '첫 요청에 page 가 없다 — 기본값으로 잘린다').not.toBeNull();
    expect(requested[0].size, '첫 요청에 size 가 없다').not.toBeNull();

    await page.getByTestId('next-button').click();

    // 2페이지 내용이 실제로 나와야 한다. 전량을 받아 잘랐다면 첫 페이지 행이 그대로 남는다.
    await expect(page.getByText(`node-${Number(requested[0].size)}`)).toBeVisible({ timeout: 60_000 });
    expect(requested.some((r) => r.page === '2'), '2페이지를 서버에 요청하지 않았다').toBe(true);
  });
});
