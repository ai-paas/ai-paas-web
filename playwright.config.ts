import { defineConfig, devices } from '@playwright/test';

// E2E는 허메틱(hermetic) 모드로 실행한다 — 모든 /api/v1 요청을 page.route로
// 가로채므로(e2e/support/api-mocks.ts) 실제 백엔드가 필요 없다.
// 실 백엔드 스모크가 필요해지면 mockApi를 붙이지 않는 spec을 별도로 추가할 것.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    locale: 'ko-KR',
    // vitest(TZ=Asia/Seoul)와 동일하게 날짜 표기를 KST로 고정
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    { name: 'chromium', testIgnore: /live\//, use: { ...devices['Desktop Chrome'] } },
    /*
     * 실 백엔드, 게이트웨이를 그대로 통과하는 검증. 목킹 스모크는 주소 체계가 갈린 것을
     * 잡지 못한다 — 백엔드는 /v1/..., 게이트웨이는 /api/v1/any-cloud/... 다.
     * 자격증명이 필요해 spec 안에서 E2E_LIVE=1 일 때만 돈다.
     */
    {
      name: 'live',
      testDir: './e2e/live',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5174' },
    },
  ],
  // 라이브 프로젝트는 이미 떠 있는 dev 서버(5174)를 쓴다 — 여기 webServer 는 목킹용이다.
  webServer: {
    // 일상 dev 서버(5173)와 충돌하지 않도록 전용 포트 사용
    command: 'pnpm dev --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // /api 프록시 target이 undefined면 vite가 기동하지 못하므로 더미를 주입한다.
    // 요청은 전부 라우트 목킹으로 가로채져 이 주소로는 실제 트래픽이 가지 않는다.
    env: { VITE_SERVER_URL: 'http://127.0.0.1:9' },
  },
});
