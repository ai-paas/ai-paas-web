import { test, expect, type Page } from '@playwright/test';

/**
 * 일괄 생성 모달이 백엔드 기본값을 그대로 받아 오는지 본다.
 *
 * <p>값을 화면에 박아 두면 스펙이나 이미지가 갈릴 때 어긋나고, 그 사실을 생성 실패로야 알게
 * 된다. 목킹으로는 그 어긋남을 잡을 수 없어 실 백엔드로 확인한다. 자원을 만들지는 않는다 —
 * 모달을 열어 목록만 확인하고 닫는다.
 */

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill(process.env.E2E_MEMBER_ID ?? '');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

test.describe('CSP 일괄 프로비저닝', () => {
  test.skip(process.env.E2E_LIVE !== '1', '실제 자격증명이 필요해 기본 실행에서 제외한다');
  test.describe.configure({ timeout: 180_000 });

  test('스위치를 켜지 않으면 버튼이 보이지 않는다', async ({ page }) => {
    await login(page);
    await page.goto('/infra-management/vm');

    await expect(page.getByRole('button', { name: '일괄 생성 (검증용)' })).toHaveCount(0);
  });

  test('CSP 7종의 기본값이 채워지고 만들 수 없는 것은 막힌다', async ({ page }) => {
    await login(page);
    await page.goto('/infra-management/vm?devTools=anycloud-e2e');

    await page.getByRole('button', { name: '일괄 생성 (검증용)' }).click();

    // 지원하는 CSP 가 모두 줄로 나와야 한다. 빠지면 "지원하지 않는다" 로 읽힌다.
    for (const csp of ['AWS', 'GCP', 'IBM', 'OCI', 'OpenStack', 'Proxmox', 'Alibaba']) {
      await expect(
        page.getByLabel(`${csp} 선택`),
        `${csp} 줄이 없다`
      ).toBeVisible({ timeout: 60_000 });
    }

    /*
     * 체크된 CSP 는 리전과 인스턴스가 채워져 있어야 한다. 비어 있으면 눌러도 생성이
     * 400 으로 끝난다 — 검증용 화면이 오히려 실패를 만든다.
     */
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    let ready = 0;
    for (let i = 0; i < count; i += 1) {
      const row = rows.nth(i);
      if (!(await row.getByRole('checkbox').isChecked())) continue;
      ready += 1;
      await expect(row.locator('td').nth(2)).not.toHaveText('—');
      await expect(row.locator('td').nth(3)).not.toHaveText('—');
    }
    expect(ready, '만들 수 있는 CSP 가 하나도 없다').toBeGreaterThan(0);

    // 접두를 다시 입력하기 전에는 생성 버튼이 잠겨 있어야 한다.
    await expect(page.getByRole('button', { name: /종 생성/ })).toBeDisabled();
  });
});
