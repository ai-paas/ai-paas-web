import { test, expect, type Page } from '@playwright/test';

/**
 * 생성 버튼이 서버 검증을 거치는지 본다.
 *
 * <p>화면은 CSP 에 지금 자리가 있는지, 자격증명이 아직 통하는지 알 수 없다. 검증을 건너뛰면
 * 인프라를 절반 만든 뒤 롤백한다 — OCI 용량 부족이 실제로 그랬다. 자원은 만들지 않는다:
 * 생성 요청은 가로채서 막는다.
 */

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill(process.env.E2E_MEMBER_ID ?? '');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

/**
 * 그 라벨을 가진 행.
 *
 * <p>hasText 로만 거르면 바깥 박스가 먼저 잡힌다 — 안에 든 다른 행의 글자까지 포함하기 때문이다.
 * 행 자신의 라벨을 기준으로 집는다.
 */
const rowOf = (page: Page, label: string) =>
  page
    .locator('.page-input_item-box')
    .filter({ has: page.locator('.page-input_item-name', { hasText: label }) })
    .first();

/** 라벨이 붙은 행에서 react-select 를 열고 첫 항목을 고른다. */
async function pickFirst(page: Page, label: string) {
  const row = rowOf(page, label);
  await row.locator('.select__control').first().click();
  const option = page.locator('.select__option').first();
  await expect(option).toBeVisible({ timeout: 60_000 });
  await option.click();
}

/** 인스턴스 사양은 select 가 아니라 카드 버튼으로 고른다. */
async function pickSpec(page: Page, label: string) {
  const card = rowOf(page, label).getByRole('button').filter({ hasText: 'vCPU' }).first();
  await expect(card).toBeVisible({ timeout: 60_000 });
  await card.click();
}

test.describe('VM 생성 사전 검증', () => {
  test.skip(process.env.E2E_LIVE !== '1', '실제 자격증명이 필요해 기본 실행에서 제외한다');
  test.describe.configure({ timeout: 180_000 });

  test('생성 전에 서버에 물어보고, 막히면 이유를 보여준다', async ({ page }) => {
    await login(page);

    // 실제로 만들지 않는다. 생성 요청은 여기서 끊는다.
    let createAttempted = false;
    await page.route('**/any-cloud/vms', async (route) => {
      if (route.request().method() === 'POST') {
        createAttempted = true;
        await route.abort();
        return;
      }
      await route.continue();
    });

    let preflightCalled = false;
    await page.route('**/any-cloud/vms/preflight', async (route) => {
      preflightCalled = true;
      // 서버만 아는 차단 사유를 흉내 낸다. 화면이 이 값을 그대로 보여줘야 한다.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          readyToProvision: false,
          errors: ['ap-tokyo-1 에 자리가 없습니다.'],
        }),
      });
    });

    await page.goto('/infra-management/vm/create');
    await page
      .getByPlaceholder('master + worker 인스턴스 집합 식별자 (RFC 1123 label). K8s cluster 도 동일 이름.')
      .fill('preflight-check-01');
    await page.getByRole('button', { name: 'AWS', exact: false }).first().click();
    await pickFirst(page, '자격증명');
    await pickFirst(page, '리전');
    // 인스턴스는 select 가 아니라 카드 목록이다. 첫 항목을 고른다.
    await pickSpec(page, 'Master 인스턴스');
    await pickSpec(page, 'Worker 인스턴스');

    await page.getByRole('button', { name: 'VM 프로비저닝 시작' }).click();

    await expect(page.getByRole('alert')).toContainText('ap-tokyo-1 에 자리가 없습니다.', {
      timeout: 60_000,
    });
    expect(preflightCalled, '서버 검증을 부르지 않았다').toBe(true);
    expect(createAttempted, '검증이 막았는데 생성이 나갔다').toBe(false);
  });
});
