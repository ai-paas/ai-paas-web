import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';
import { CreateServiceButton } from './create-service-button';

// SCSS 모듈 모킹
vi.mock('@/pages/service/service.module.scss', () => ({
  default: {
    modalBox: 'modalBox',
    inputBox: 'inputBox',
  },
}));

describe('CreateServiceButton', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================
  describe('렌더링', () => {
    it('"생성" 버튼이 렌더링된다', () => {
      render(<CreateServiceButton />);

      expect(screen.getByRole('button', { name: '생성' })).toBeInTheDocument();
    });

    it('초기 상태에서 모달이 표시되지 않는다', () => {
      render(<CreateServiceButton />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // 모달 인터랙션 테스트
  // ============================================
  describe('모달 인터랙션', () => {
    it('생성 버튼 클릭 시 모달이 열린다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('서비스 생성')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('이름을 입력해주세요.')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('설명을 입력해주세요.')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('태그 내용을 입력해주세요.')
      ).toBeInTheDocument();
    });

    it('취소 버튼 클릭 시 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '취소' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('모달이 닫힐 때 폼이 초기화된다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      // 모달 열기
      await user.click(screen.getByRole('button', { name: '생성' }));

      // 입력값 작성
      const nameInput = screen.getByPlaceholderText('이름을 입력해주세요.');
      await user.type(nameInput, '테스트 서비스');
      expect(nameInput).toHaveValue('테스트 서비스');

      // 모달 닫기
      await user.click(screen.getByRole('button', { name: '취소' }));

      // 모달 다시 열기
      await user.click(screen.getByRole('button', { name: '생성' }));

      // 입력값이 초기화되었는지 확인
      expect(screen.getByPlaceholderText('이름을 입력해주세요.')).toHaveValue(
        ''
      );
    });
  });

  // ============================================
  // 폼 입력 테스트
  // ============================================
  describe('폼 입력', () => {
    it('이름 입력 필드에 값을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      const nameInput = screen.getByPlaceholderText('이름을 입력해주세요.');
      await user.type(nameInput, '새로운 서비스');

      expect(nameInput).toHaveValue('새로운 서비스');
    });

    it('설명 입력 필드에 값을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      const descInput = screen.getByPlaceholderText('설명을 입력해주세요.');
      await user.type(descInput, '서비스 설명입니다');

      expect(descInput).toHaveValue('서비스 설명입니다');
    });

    it('태그 입력 필드에 값을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      const tagsInput = screen.getByPlaceholderText('태그 내용을 입력해주세요.');
      await user.type(tagsInput, 'tag1, tag2, tag3');

      expect(tagsInput).toHaveValue('tag1, tag2, tag3');
    });
  });

  // ============================================
  // 폼 제출 테스트
  // ============================================
  describe('폼 제출', () => {
    it('확인 버튼 클릭 시 서비스가 생성되고 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      // 폼 입력
      await user.type(
        screen.getByPlaceholderText('이름을 입력해주세요.'),
        '테스트 서비스'
      );
      await user.type(
        screen.getByPlaceholderText('설명을 입력해주세요.'),
        '테스트 설명'
      );
      await user.type(
        screen.getByPlaceholderText('태그 내용을 입력해주세요.'),
        'tag1, tag2'
      );

      // 제출
      await user.click(screen.getByRole('button', { name: '확인' }));

      // 모달이 닫힘
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('빈 태그일 경우에도 제출이 가능하다', async () => {
      const user = userEvent.setup();
      render(<CreateServiceButton />);

      await user.click(screen.getByRole('button', { name: '생성' }));

      await user.type(
        screen.getByPlaceholderText('이름을 입력해주세요.'),
        '테스트'
      );
      await user.type(
        screen.getByPlaceholderText('설명을 입력해주세요.'),
        '설명'
      );
      // 태그는 입력하지 않음

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
