import { describe, expect, it, vi } from 'vitest';
import { renderWithUser, screen } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

import MemberCreatePage from './page';

// 정규식 전수 검증은 create-member-action.test.tsx가 담당한다.
// 여기서는 페이지 자체의 인라인(onChange) 검증 — 에러 문구가 입력 즉시 표시되고
// 유효해지면 사라지는 동작 — 과 연락처 포맷팅, 액션 컴포넌트와의 배선만 검증한다.
const renderPage = () => renderWithUser(<MemberCreatePage />);

const fields = {
  name: '이름을 입력해주세요.',
  memberId: 'ID를 입력해주세요.',
  email: 'email을 입력해주세요.',
  password: '비밀번호를 입력해주세요.',
  passwordConfirm: '비밀번호를 한 번 더 입력해주세요.',
  phone: '숫자만 입력해주세요.',
} as const;

describe('MemberCreatePage', () => {
  describe('인라인 검증', () => {
    it('아이디가 5자 미만이면 입력 즉시 에러를 표시하고 유효해지면 지운다', async () => {
      const { user } = renderPage();
      const input = screen.getByPlaceholderText(fields.memberId);

      await user.type(input, 'abc');
      expect(
        screen.getByText("아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.")
      ).toBeInTheDocument();

      await user.type(input, '-user1');
      expect(
        screen.queryByText("아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.")
      ).not.toBeInTheDocument();
    });

    it('이메일 형식이 맞지 않으면 에러를 표시하고 유효해지면 지운다', async () => {
      const { user } = renderPage();
      const input = screen.getByPlaceholderText(fields.email);

      await user.type(input, 'hong@example');
      expect(screen.getByText('이메일 형식이 올바르지 않습니다.')).toBeInTheDocument();

      await user.type(input, '.com');
      expect(screen.queryByText('이메일 형식이 올바르지 않습니다.')).not.toBeInTheDocument();
    });

    it('비밀번호 규칙(8~16자·대소문자·숫자·특수문자)에 맞지 않으면 에러를 표시한다', async () => {
      const { user } = renderPage();
      const input = screen.getByPlaceholderText(fields.password);

      await user.type(input, 'abcd1234');
      expect(
        screen.getByText('비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.')
      ).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, 'Abcd123!');
      expect(
        screen.queryByText('비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.')
      ).not.toBeInTheDocument();
    });

    it('비밀번호 확인 불일치 에러는 비밀번호 쪽을 바꿔도 즉시 갱신된다', async () => {
      const { user } = renderPage();
      const password = screen.getByPlaceholderText(fields.password);
      const confirm = screen.getByPlaceholderText(fields.passwordConfirm);

      await user.type(password, 'Abcd123!');
      await user.type(confirm, 'Abcd123!');
      expect(screen.queryByText('비밀번호가 일치하지 않습니다.')).not.toBeInTheDocument();

      // 확인란이 아니라 비밀번호란을 수정해도 불일치 에러가 나타난다
      await user.type(password, 'x');
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();

      // 확인란을 다시 일치시키면 사라진다
      await user.type(confirm, 'x');
      expect(screen.queryByText('비밀번호가 일치하지 않습니다.')).not.toBeInTheDocument();
    });
  });

  describe('연락처', () => {
    it('숫자만 남기고 11자리로 잘라 하이픈 포맷으로 표시한다', async () => {
      const { user } = renderPage();
      const input = screen.getByPlaceholderText(fields.phone);

      await user.type(input, '010abc12345678999');

      expect(input).toHaveValue('010-1234-5678');
    });
  });

  describe('역할', () => {
    it('기본값은 사용자이고 관리자를 선택할 수 있다', async () => {
      const { user } = renderPage();

      expect(screen.getByRole('radio', { name: '사용자' })).toBeChecked();
      expect(screen.getByRole('radio', { name: '관리자' })).not.toBeChecked();

      await user.click(screen.getByRole('radio', { name: '관리자' }));

      expect(screen.getByRole('radio', { name: '관리자' })).toBeChecked();
      expect(screen.getByRole('radio', { name: '사용자' })).not.toBeChecked();
    });
  });

  describe('액션', () => {
    it('취소를 클릭하면 멤버 목록으로 이동한다', async () => {
      const { user } = renderPage();

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockNavigate).toHaveBeenCalledWith('/member-management');
    });

    it('유효한 폼으로 생성을 클릭하면 확인 다이얼로그가 열린다 (폼 상태가 액션에 전달됨)', async () => {
      const { user } = renderPage();

      await user.type(screen.getByPlaceholderText(fields.name), '홍길동');
      await user.type(screen.getByPlaceholderText(fields.memberId), 'hong-01');
      await user.type(screen.getByPlaceholderText(fields.email), 'hong@example.com');
      await user.type(screen.getByPlaceholderText(fields.password), 'Abcd123!');
      await user.type(screen.getByPlaceholderText(fields.passwordConfirm), 'Abcd123!');
      await user.type(screen.getByPlaceholderText(fields.phone), '01012345678');

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByText('입력하신 정보로 회원을 생성하시겠습니까?')).toBeInTheDocument();
    });
  });
});
