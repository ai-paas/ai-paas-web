/**
 * 로그인 페이지 접근성 스모크 (TEST_PLAN 3D).
 *
 * page.test.tsx와 달리 innogrid-ui 목을 import하지 않는다 — a11y 검사는 실제로
 * 출하되는 마크업(실제 @innogrid/ui)을 대상으로 해야 의미가 있다.
 *
 * 실제 UI 컴포넌트까지 렌더해 label 연결과 접근 가능한 이름을 함께 검증한다.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { HttpResponse, http } from 'msw';
import { renderWithUser, screen } from '@/test/utils/test-utils';
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
    const { container, user } = renderWithUser(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
      { route: '/login', path: '/login' }
    );
    await screen.findByRole('button', { name: '로그인' });
    await user.type(screen.getByLabelText('아이디'), 'tester');
    await user.type(screen.getByLabelText('비밀번호'), 'secret1!');

    // 값 입력 후 나타나는 아이디 지우기·비밀번호 표시 버튼까지 검사한다.
    // color-contrast는 jsdom(canvas 미구현)에서 판정 불가 — 명시적으로 제외
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });

    expect(results).toHaveNoViolations();
  });
});
