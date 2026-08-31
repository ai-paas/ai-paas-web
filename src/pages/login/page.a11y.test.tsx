/**
 * 로그인 페이지 접근성 스모크 (TEST_PLAN 3D).
 *
 * page.test.tsx와 달리 innogrid-ui 목을 import하지 않는다 — a11y 검사는 실제로
 * 출하되는 마크업(실제 @innogrid/ui)을 대상으로 해야 의미가 있다.
 *
 * 참고: '아이디'/'비밀번호' 라벨 span이 input과 연결되지 않은 이슈(부록 A)는
 * axe 기본 룰로는 검출되지 않는다 — label 규칙이 non-empty-placeholder 체크를
 * 통과 조건으로 인정하고, 두 input 모두 placeholder를 가진다(Password는 컴포넌트
 * 기본값 '비밀번호를 입력해주세요.'). placeholder-only 라벨링 개선은 별도 과제.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { HttpResponse, http } from 'msw';
import { render, screen } from '@/test/utils/test-utils';
import { server } from '@/test/mocks/server';
import { BASE_URL } from '@/test/mocks/handlers';
import { AuthProvider } from '@/hooks/useAuth';
import LoginPage from './page';

describe('로그인 페이지 접근성 스모크', () => {
  beforeEach(() => {
    // 비인증 상태 고정 — 기본 refresh 핸들러는 성공을 반환해 폼 대신 <Navigate>가 렌더된다
    server.use(
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json({ message: 'expired' }, { status: 401 })
      )
    );
  });

  it('로그인 폼에 axe 위반이 없다', async () => {
    const { container } = render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
      { route: '/login', path: '/login' }
    );
    await screen.findByRole('button', { name: '로그인' });

    // color-contrast는 jsdom(canvas 미구현)에서 판정 불가 — 명시적으로 제외
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(results).toHaveNoViolations();
  });
});
