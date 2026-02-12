import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';
import { EditServiceButton } from './edit-service-button';

// SCSS 모듈 모킹
vi.mock('../../../pages/service/service.module.scss', () => ({
  default: {
    modalBox: 'modalBox',
    inputBox: 'inputBox',
  },
}));

describe('EditServiceButton', () => {
  // ============================================
  // 렌더링 테스트
  // ============================================
  describe('렌더링', () => {
    it('"편집" 버튼이 렌더링된다', () => {
      render(<EditServiceButton serviceId="srv-001" />);

      expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
    });

    it('serviceId가 없으면 버튼이 비활성화된다', () => {
      render(<EditServiceButton />);

      expect(screen.getByRole('button', { name: '편집' })).toBeDisabled();
    });

    it('serviceId가 있으면 버튼이 활성화된다', () => {
      render(<EditServiceButton serviceId="srv-001" />);

      expect(screen.getByRole('button', { name: '편집' })).not.toBeDisabled();
    });
  });

  // ============================================
  // 모달 인터랙션 테스트
  // ============================================
  describe('모달 인터랙션', () => {
    it('편집 버튼 클릭 시 모달이 열린다', async () => {
      const user = userEvent.setup();
      render(<EditServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '편집' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByText('서비스 편집')).toBeInTheDocument();
    });

    it('serviceId가 없으면 버튼 클릭해도 모달이 열리지 않는다', async () => {
      render(<EditServiceButton />);

      // 비활성화된 버튼
      const button = screen.getByRole('button', { name: '편집' });
      expect(button).toBeDisabled();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('모달이 열릴 때 기존 서비스 데이터가 폼에 채워진다', async () => {
      const user = userEvent.setup();
      render(<EditServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '편집' }));

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('이름을 입력해주세요.')
        ).toHaveValue('테스트 서비스 1');
      });

      expect(
        screen.getByPlaceholderText('태그 내용을 입력해주세요.')
      ).toHaveValue('tag1, tag2');
    });

    it('취소 버튼 클릭 시 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<EditServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '편집' }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '취소' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 폼 수정 및 제출 테스트
  // ============================================
  describe('폼 수정 및 제출', () => {
    it('이름을 수정할 수 있다', async () => {
      const user = userEvent.setup();
      render(<EditServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '편집' }));

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('이름을 입력해주세요.')
        ).toHaveValue('테스트 서비스 1');
      });

      const nameInput = screen.getByPlaceholderText('이름을 입력해주세요.');
      await user.clear(nameInput);
      await user.type(nameInput, '수정된 서비스명');

      expect(nameInput).toHaveValue('수정된 서비스명');
    });

    it('확인 버튼 클릭 시 서비스가 수정되고 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<EditServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '편집' }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('이름을 입력해주세요.');
      await user.clear(nameInput);
      await user.type(nameInput, '수정된 이름');

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
