import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithUser, screen } from '@/test/utils/test-utils';
import ErrorBoundary from './error-boundary';

// 외부 플래그로 폭발 여부를 제어해 "다시 시도" 복구 경로를 검증한다
let shouldThrow = false;
const Bomb = () => {
  if (shouldThrow) throw new Error('렌더 중 폭발');
  return <div>정상 콘텐츠</div>;
};

describe('ErrorBoundary', () => {
  // React가 캐치된 에러를 console.error로 다시 출력하므로 테스트 로그를 조용히 한다
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('에러가 없으면 자식을 그대로 렌더링한다', () => {
    shouldThrow = false;
    renderWithUser(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('문제가 발생했습니다!')).not.toBeInTheDocument();
  });

  it('자식 렌더링이 throw하면 폴백 UI를 표시하고 에러를 로깅한다', () => {
    shouldThrow = true;
    renderWithUser(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    expect(screen.queryByText('정상 콘텐츠')).not.toBeInTheDocument();
    // componentDidCatch가 원인 에러와 컴포넌트 스택을 로깅한다
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Uncaught error:',
      expect.objectContaining({ message: '렌더 중 폭발' }),
      expect.anything()
    );
  });

  it('"다시 시도" 클릭 시 자식을 다시 렌더링한다', async () => {
    shouldThrow = true;
    const { user } = renderWithUser(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다!')).toBeInTheDocument();

    // 원인이 해소된 뒤 다시 시도하면 정상 콘텐츠로 복구된다
    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('문제가 발생했습니다!')).not.toBeInTheDocument();
  });
});
