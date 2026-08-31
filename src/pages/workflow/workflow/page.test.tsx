/**
 * 워크플로우 목록 페이지 통합 테스트 (TEST_PLAN 3B).
 * 목록 페이지 공용 패턴은 서비스 목록(src/pages/service/page.test.tsx)이 기준 템플릿 —
 * 여기서는 이 페이지 고유 요소(상태 라벨 매핑, 버튼 4종 활성화, 편집 이동)와
 * 검색→페이지네이션 초기화 와이어링만 확인한다.
 */
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import WorkflowPage from './page';
import { server } from '@/test/mocks/server';
import { BASE_URL, mockWorkflow } from '@/test/mocks/handlers';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';
import {
  createPagedListHandler,
  getPageIndexInput,
  goToNextPage,
  renderListPage,
  searchListFor,
  toggleRowSelection,
} from '@/test/utils/list-page';
import { screen, waitFor, within } from '@/test/utils/test-utils';
import type { Workflow } from '@/types/workflow';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

const pad = (n: number) => String(n).padStart(2, '0');

// 12개 = 2페이지(size 10), 상태 3종 순환 — 상태 라벨 매핑 검증용
const workflows: Workflow[] = Array.from({ length: 12 }, (_, i) => ({
  ...mockWorkflow,
  id: i + 1,
  surro_workflow_id: `wf-${pad(i + 1)}`,
  name: `워크플로우 ${pad(i + 1)}`,
  status: (['DRAFT', 'ACTIVE', 'ERROR'] as const)[i % 3],
}));

const setupPagedWorkflows = () => {
  const paged = createPagedListHandler('workflows', workflows);
  server.use(paged.handler);
  return paged;
};

describe('워크플로우 목록 페이지', () => {
  installDomMeasurementStubs();

  it('목록을 렌더하고 상태 코드를 한국어 라벨로 매핑한다', async () => {
    const { lastParams } = setupPagedWorkflows();
    renderListPage(<WorkflowPage />);

    expect(await screen.findByRole('link', { name: '워크플로우 01' })).toHaveAttribute(
      'href',
      '/workflow/workflow/wf-01'
    );

    // DRAFT/ACTIVE/ERROR → 임시저장/정상/오류
    expect(within(screen.getByTestId('row-0')).getByText('임시저장')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-1')).getByText('정상')).toBeInTheDocument();
    expect(within(screen.getByTestId('row-2')).getByText('오류')).toBeInTheDocument();

    const params = lastParams();
    expect(params?.get('page')).toBe('1');
    expect(params?.get('sort')).toBe('name');
  });

  it('행을 선택하면 편집/삭제/실행/배포 중지가 활성화되고, 편집 클릭 시 편집 페이지로 이동한다', async () => {
    setupPagedWorkflows();
    const { user } = renderListPage(<WorkflowPage />);
    await screen.findByRole('link', { name: '워크플로우 01' });

    const buttons = ['편집', '삭제', '실행', '배포 중지'].map((name) =>
      screen.getByRole('button', { name })
    );
    buttons.forEach((button) => expect(button).toBeDisabled());

    await toggleRowSelection(user, 0);
    await waitFor(() => buttons.forEach((button) => expect(button).toBeEnabled()));

    await user.click(screen.getByRole('button', { name: '편집' }));
    expect(mockNavigate).toHaveBeenCalledWith('/workflow/workflow/wf-01/edit');
  });

  it('2페이지에서 검색하면 1페이지로 초기화되고 search 파라미터가 실린다', async () => {
    const { lastParams } = setupPagedWorkflows();
    const { user } = renderListPage(<WorkflowPage />);
    await screen.findByRole('link', { name: '워크플로우 01' });

    await goToNextPage(user);
    expect(await screen.findByRole('link', { name: '워크플로우 11' })).toBeInTheDocument();

    await searchListFor(user, '워크플로우 05');

    expect(await screen.findByRole('link', { name: '워크플로우 05' })).toBeInTheDocument();
    await waitFor(() => {
      const params = lastParams();
      expect(params?.get('page')).toBe('1');
      expect(params?.get('search')).toBe('워크플로우 05');
    });
    expect(getPageIndexInput()).toHaveValue('1');
  });

  it('데이터가 없으면 생성 안내 빈 상태를 보여준다', async () => {
    const { handler } = createPagedListHandler<Workflow>('workflows', []);
    server.use(handler);
    renderListPage(<WorkflowPage />);

    expect(await screen.findByText('워크플로우가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('생성 버튼을 클릭해 워크플로우를 생성해 보세요.')).toBeInTheDocument();
  });

  it('목록 조회가 실패하면 에러 문구를 보여준다', async () => {
    server.use(
      http.get(`${BASE_URL}/workflows`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );
    renderListPage(<WorkflowPage />);

    expect(
      await screen.findByText('워크플로우 목록을 불러오는 데 실패했습니다.')
    ).toBeInTheDocument();
  });
});
