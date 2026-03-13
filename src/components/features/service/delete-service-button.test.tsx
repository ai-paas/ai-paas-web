import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import '@/test/mocks/innogrid-ui';
import { DeleteServiceButton } from './delete-service-button';

// react-router의 useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DeleteServiceButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // ============================================
  // 렌더링 테스트
  // ============================================
  describe('렌더링', () => {
    it('"삭제" 버튼이 렌더링된다', () => {
      render(<DeleteServiceButton serviceId="srv-001" />);

      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('serviceId가 없으면 버튼이 비활성화된다', () => {
      render(<DeleteServiceButton />);

      expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
    });

    it('serviceId가 있으면 버튼이 활성화된다', () => {
      render(<DeleteServiceButton serviceId="srv-001" />);

      expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled();
    });
  });

  // ============================================
  // AlertDialog 인터랙션 테스트
  // ============================================
  describe('AlertDialog 인터랙션', () => {
    it('삭제 버튼 클릭 시 확인 대화상자가 열린다', async () => {
      const user = userEvent.setup();
      render(<DeleteServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(
        screen.getByText('서비스를 삭제하시겠습니까?')
      ).toBeInTheDocument();
    });

    it('serviceId가 없으면 클릭해도 대화상자가 열리지 않는다', async () => {
      render(<DeleteServiceButton />);

      const button = screen.getByRole('button', { name: '삭제' });
      expect(button).toBeDisabled();

      expect(
        screen.queryByText('서비스를 삭제하시겠습니까?')
      ).not.toBeInTheDocument();
    });

    it('취소 버튼 클릭 시 대화상자가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<DeleteServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '삭제' }));
      expect(
        screen.getByText('서비스를 삭제하시겠습니까?')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '취소' }));

      await waitFor(() => {
        expect(
          screen.queryByText('서비스를 삭제하시겠습니까?')
        ).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // 삭제 동작 테스트
  // ============================================
  describe('삭제 동작', () => {
    it('확인 버튼 클릭 시 서비스가 삭제되고 /service로 이동한다', async () => {
      const user = userEvent.setup();
      render(<DeleteServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      await user.click(screen.getByRole('button', { name: '확인' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/service');
      });
    });

    it('serviceId가 없는 상태에서는 삭제가 실행되지 않는다', () => {
      render(<DeleteServiceButton />);

      // 버튼이 비활성화되어 있으므로 navigate가 호출되지 않아야 함
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // 대화상자 UI 테스트
  // ============================================
  describe('대화상자 UI', () => {
    it('확인 버튼 텍스트가 "확인"이다', async () => {
      const user = userEvent.setup();
      render(<DeleteServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });

    it('취소 버튼 텍스트가 "취소"이다', async () => {
      const user = userEvent.setup();
      render(<DeleteServiceButton serviceId="srv-001" />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });
});
