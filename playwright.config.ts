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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
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
