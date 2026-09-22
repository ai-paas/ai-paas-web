import { test, expect, type Page } from '@playwright/test';

/**
 * 실제 백엔드, 게이트웨이를 그대로 통과하는 검증.
 *
 * <p>목킹 스모크는 화면이 응답을 어떻게 그리는지만 본다. 백엔드와 게이트웨이는 주소 체계가 달라
 * (`/v1/providers/...` 대 `/api/v1/any-cloud/providers/...`) 한쪽만 고치면 화면에서만 빈 목록이
 * 된다. 자격증명이 필요한 조회라 CI 에서는 돌지 않는다 — `E2E_LIVE=1` 일 때만 실행한다.
 */

const CSPS = ['AWS', 'GCP', 'IBM', 'OCI', 'OpenStack', 'Proxmox', 'Alibaba'] as const;

/** 리전이 없는 하이퍼바이저. 화면도 리전 칸을 감춘다. */
const NO_REGION = new Set(['Proxmox']);

/**
 * 계정에서 값을 열거할 수 있어 목록으로 떠야 하는 칸.
 *
 * <p>AWS 는 providerSpec 이 없고, Proxmox 이미지는 URL 로 받는다 — 목록을 흉내 내면 없는
 * 선택지를 고르게 된다.
 */
/** 이미지 식별자를 emitter 가 그대로 넘겨 이름으로 찾을 수 없는 CSP. */
const IMAGE_REQUIRED = new Set(['IBM', 'OCI', 'Alibaba']);

const DROPDOWN_FIELDS: Partial<Record<(typeof CSPS)[number], string[]>> = {
  GCP: ['프로젝트'],
  IBM: ['존', '리소스 그룹'],
  OCI: ['컴파트먼트'],
  OpenStack: ['인스턴스 사양', '외부 네트워크', 'Floating IP 풀'],
  Proxmox: ['PVE 노드', '디스크 저장소', '네트워크 브리지'],
  Alibaba: ['존'],
};

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('아이디를 입력해주세요.').fill(process.env.E2E_MEMBER_ID ?? '');
  await page.getByPlaceholder('비밀번호를 입력해주세요.').fill(process.env.E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 30_000 });
}

/**
 * react-select 는 열어야 목록이 뜬다.
 *
 * <p>placeholder 를 클릭하면 그 위를 덮는 input 컨테이너가 이벤트를 가로챈다. 라벨이 붙은
 * 행에서 control 을 찾아 연다.
 */
async function openSelectAndCount(page: Page, label: string) {
  const row = page.locator('.page-input_item-box').filter({ hasText: label }).first();
  await row.locator('.select__control').first().click();
  const options = page.locator('.select__option');
  await expect(options.first()).toBeVisible({ timeout: 60_000 });
  return options.count();
}

test.describe('VM 생성 화면이 CSP 별 선택지를 실제로 받아온다', () => {
  test.skip(process.env.E2E_LIVE !== '1', '실제 자격증명이 필요해 기본 실행에서 제외한다');
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  for (const csp of CSPS) {
    test(`${csp} — 자격증명, 리전, CSP 고유 설정이 목록으로 채워진다`, async ({ page }) => {
      await login(page);
      await page.goto('/infra-management/vm/create');

      await page.getByRole('button', { name: csp, exact: false }).first().click();

      const credentials = await openSelectAndCount(page, '자격증명');
      expect(credentials, `${csp} 자격증명 목록이 비어 있다`).toBeGreaterThan(0);
      await page.keyboard.press('Enter');

      if (!NO_REGION.has(csp)) {
        const regions = await openSelectAndCount(page, '리전');
        expect(regions, `${csp} 리전 목록이 비어 있다`).toBeGreaterThan(0);
        await page.keyboard.press('Enter');
      }

      /*
       * CSP 고유 설정은 자유 입력이 아니라 목록이어야 한다. OCID 나 빌드 날짜가 붙은 이미지
       * ID 를 사용자가 받아 적게 두면 오타가 프로비저닝 중반에야 드러난다.
       */
      /*
       * 이미지는 IBM, OCI, Alibaba 에서 필수다. 고급 옵션 안에 접혀 있으면 비운 채로 만들기를
       * 눌러 프로비저닝 중반에야 거절당한다 — 본문에 필수 표시와 함께 있어야 한다.
       */
      if (IMAGE_REQUIRED.has(csp)) {
        const row = page.locator('.page-input_item-box').filter({ hasText: 'OS 이미지' }).first();
        await expect(row, `${csp} 의 OS 이미지 칸이 본문에 없다`).toBeVisible({ timeout: 60_000 });
        await expect(
          row.locator('.page-icon-requisite'),
          `${csp} 의 OS 이미지에 필수 표시가 없다`
        ).toBeVisible();
      }

      // 애드온은 고급 옵션에 숨지 않는다. 모니터링만 보이고 나머지는 화면에 없었다.
      await expect(page.getByLabel('모니터링', { exact: true })).toBeChecked();
      await expect(page.getByLabel('Ingress NGINX', { exact: true })).not.toBeChecked();
      await expect(page.getByRole('button', { name: '펼치기' })).toHaveCount(0);

      for (const field of DROPDOWN_FIELDS[csp] ?? []) {
        const row = page.locator('.page-input_item-box').filter({ hasText: field }).first();
        await expect(row, `${csp} 의 ${field} 칸이 없다`).toBeVisible({ timeout: 60_000 });
        await expect(
          row.locator('.select__control'),
          `${csp} 의 ${field} 가 목록이 아니라 자유 입력이다`
        ).toBeVisible({ timeout: 60_000 });
      }
    });
  }
});
