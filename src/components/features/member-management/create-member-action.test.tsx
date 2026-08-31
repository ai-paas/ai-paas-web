import '@/test/mocks/innogrid-ui';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { BASE_URL, mockMembers } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import type { CreateMemberRequest } from '@/types/member';
import { CreateMemberAction } from './create-member-action';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

// 모든 수동 정규식 검증을 통과하는 기준 폼 데이터 — 각 테스트는 필요한 필드만 덮어쓴다
const validFormData = {
  name: '홍길동',
  memberId: 'hong-gildong',
  email: 'hong@example.com',
  password: 'Abcd123!',
  passwordConfirm: 'Abcd123!',
  phone: '01012345678',
  role: 'user',
  description: '테스트 회원',
};

const CONFIRM_QUESTION = '입력하신 정보로 회원을 생성하시겠습니까?';

describe('CreateMemberAction', () => {
  describe('렌더링', () => {
    it('"생성" 버튼이 렌더링되고 초기에는 모달이 없다', () => {
      renderWithUser(<CreateMemberAction formData={validFormData} />);

      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('폼 검증 (수동 정규식)', () => {
    it.each([
      ['이름이 비어 있으면', { name: '' }, '필수 항목을 입력해주세요.'],
      ['연락처가 비어 있으면', { phone: '' }, '필수 항목을 입력해주세요.'],
      ['이름에 한글 외 문자가 있으면', { name: 'John' }, '이름은 한글만 입력 가능합니다.'],
      [
        '이름에 숫자가 섞여 있으면',
        { name: '홍길동1' },
        '이름은 한글만 입력 가능합니다.',
      ],
      [
        '아이디에 대문자가 있으면',
        { memberId: 'Hong-gildong' },
        "아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.",
      ],
      [
        '아이디가 5자 미만이면',
        { memberId: 'abcd' },
        "아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.",
      ],
      [
        '이메일에 최상위 도메인이 없으면',
        { email: 'hong@example' },
        '이메일 형식이 올바르지 않습니다.',
      ],
      // 버그 의심 — 팀 확인 필요: 로컬 파트에 '.'을 허용하지 않아 통상적인 이메일이 거부된다
      [
        '이메일 로컬 파트에 점이 있으면 (현재 동작 고정)',
        { email: 'hong.gildong@example.com' },
        '이메일 형식이 올바르지 않습니다.',
      ],
      [
        '비밀번호에 대문자가 없으면',
        { password: 'abcd123!', passwordConfirm: 'abcd123!' },
        '비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.',
      ],
      [
        '비밀번호가 8자 미만이면',
        { password: 'Ab1!def', passwordConfirm: 'Ab1!def' },
        '비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.',
      ],
      [
        '비밀번호 확인이 다르면',
        { passwordConfirm: 'Abcd123?' },
        '비밀번호가 일치하지 않습니다.',
      ],
      // 필수 체크 목록에 passwordConfirm이 없어 빈 확인값은 불일치 검증에서 걸린다
      [
        '비밀번호 확인이 비어 있으면',
        { passwordConfirm: '' },
        '비밀번호가 일치하지 않습니다.',
      ],
      [
        '연락처에 하이픈이 있으면',
        { phone: '010-1234-5678' },
        '연락처는 숫자만 입력 가능하며 10~11자리여야 합니다.',
      ],
      [
        '연락처가 10자리 미만이면',
        { phone: '123456789' },
        '연락처는 숫자만 입력 가능하며 10~11자리여야 합니다.',
      ],
    ])('%s 에러 모달이 뜨고 확인 모달·요청이 발생하지 않는다', async (_label, override, message) => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/members`, () => {
          requestSpy();
          return HttpResponse.json(mockMembers[0]);
        })
      );
      const { user } = renderWithUser(
        <CreateMemberAction formData={{ ...validFormData, ...override }} />
      );

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByRole('alertdialog')).toHaveTextContent(message);
      expect(screen.queryByText(CONFIRM_QUESTION)).not.toBeInTheDocument();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('에러 모달의 확인 버튼을 누르면 모달이 닫힌다', async () => {
      const { user } = renderWithUser(
        <CreateMemberAction formData={{ ...validFormData, name: '' }} />
      );

      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('확인 모달', () => {
    it('검증을 통과하면 확인 모달이 열리고, 취소하면 요청 없이 닫힌다', async () => {
      const requestSpy = vi.fn();
      server.use(
        http.post(`${BASE_URL}/members`, () => {
          requestSpy();
          return HttpResponse.json(mockMembers[0]);
        })
      );
      const { user } = renderWithUser(<CreateMemberAction formData={validFormData} />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(screen.getByText(CONFIRM_QUESTION)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '취소' }));

      await waitFor(() => {
        expect(screen.queryByText(CONFIRM_QUESTION)).not.toBeInTheDocument();
      });
      expect(requestSpy).not.toHaveBeenCalled();
    });
  });

  describe('생성 요청', () => {
    it('확인 시 폼 데이터가 snake_case 페이로드로 전송되고 성공 모달 닫기 후 목록으로 이동한다', async () => {
      let captured: CreateMemberRequest | undefined;
      server.use(
        http.post(`${BASE_URL}/members`, async ({ request }) => {
          captured = (await request.json()) as CreateMemberRequest;
          return HttpResponse.json({ ...mockMembers[0], member_id: 'hong-gildong' });
        })
      );
      const { user } = renderWithUser(<CreateMemberAction formData={validFormData} />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(captured).toBeDefined();
      });
      expect(captured).toEqual({
        name: '홍길동',
        member_id: 'hong-gildong',
        email: 'hong@example.com',
        phone: '01012345678',
        role: 'user',
        is_active: true,
        description: '테스트 회원',
        password: 'Abcd123!',
        password_confirm: 'Abcd123!',
      });

      // 결과 모달에 생성된 ID가 표시된다
      expect(
        await screen.findByText('회원 생성이 완료되었습니다. ID: hong-gildong')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '닫기' }));
      expect(mockNavigate).toHaveBeenCalledWith('/member-management');
    });

    it('생성 실패 시 실패 모달이 뜨고 닫아도 이동하지 않는다', async () => {
      server.use(
        http.post(`${BASE_URL}/members`, () =>
          HttpResponse.json({ message: 'error' }, { status: 500 })
        )
      );
      const { user } = renderWithUser(<CreateMemberAction formData={validFormData} />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(
        await screen.findByText('회원 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '닫기' }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
