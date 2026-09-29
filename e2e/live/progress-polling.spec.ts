import { test, expect, type Page } from '@playwright/test';

/**
 * 진행 중인 작업이 있으면 목록이 스스로 갱신되는지 본다.
 *
 * <p>자원은 만들지 않는다 — 목록 응답을 가로채 상태만 바꿔 준다. 실제 클러스터를 만들어
 * 확인하면 검증 한 번에 수 분과 과금이 든다.
 */

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill(process.env.E2E_MEMBER_ID ?? '');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

test.describe('진행 상황 자동 추적', () => {
  test.skip(process.env.E2E_LIVE !== '1', '실제 자격증명이 필요해 기본 실행에서 제외한다');
  test.describe.configure({ timeout: 180_000 });

  test('만들어지는 중이면 새로고침 없이 상태가 바뀐다', async ({ page }) => {
    await login(page);

    let calls = 0;
    // 쿼리 없이 부르기도 한다. 목록 GET 만 가로챈다.
    await page.route(/\/any-cloud\/vms(\?|$)/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      calls += 1;
      // 세 번째 응답부터 완료로 바꾼다. 화면이 다시 묻지 않으면 영영 PROVISIONING 이다.
      const status = calls >= 3 ? 'READY' : 'PROVISIONING';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                clusterName: 'poll-demo-01',
                clusterProvider: 'AWS',
                status,
                region: 'ap-northeast-2',
              },
            ],
          },
        }),
      });
    });

    await page.goto('/infra-management/vm');

    await expect(page.getByText('poll-demo-01').first()).toBeVisible({ timeout: 60_000 });
    // 새로고침 없이 완료로 바뀌어야 한다.
    await expect(page.getByText('READY').first()).toBeVisible({ timeout: 60_000 });
    expect(calls, '목록을 한 번만 물었다 — 폴링이 꺼져 있다').toBeGreaterThan(1);
  });
});
