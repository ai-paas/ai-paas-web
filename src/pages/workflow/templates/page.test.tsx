/**
 * 워크플로우 템플릿 목록 페이지 통합 테스트 (TEST_PLAN 3B).
 * 목록 페이지 공용 패턴은 서비스 목록(src/pages/service/page.test.tsx)이 기준 템플릿.
 *
 * 이 페이지 고유: useGetTemplates에는 search 파라미터가 없어 검색이 서버로 전달되지
 * 않고 Table의 globalFilter(클라이언트 필터)로만 동작한다 — 현재 페이지에 로드된
 * 행만 걸러진다는 뜻이므로 특성화로 고정한다. 삭제 플로우는 페이지 와이어링
 * (onDeleted → 선택 해제)까지 확인한다.
 */
import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import WorkflowTemplatePage from './page';
import { server } from '@/test/mocks/server';
import { BASE_URL, mockWorkflowTemplate } from '@/test/mocks/handlers';
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
import type { WorkflowTemplateBrief } from '@/types/workflow';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual<typeof import('react-router')>('react-router')),
  useNavigate: () => mockNavigate,
}));

const pad = (n: number) => String(n).padStart(2, '0');

// 12개 = 2페이지(size 10)
const templates: WorkflowTemplateBrief[] = Array.from({ length: 12 }, (_, i) => ({
  ...mockWorkflowTemplate,
  id: `tpl-${pad(i + 1)}`,
  name: `템플릿 ${pad(i + 1)}`,
  usage_count: i,
  creator: { ...mockWorkflowTemplate.creator, name: `작성자${pad(i + 1)}` },
}));

const setupPagedTemplates = () => {
  const paged = createPagedListHandler('workflows/templates', templates, {
    envelope: (items, { total }) => ({ total, items }),
  });
  server.use(paged.handler);
  return paged;
};

describe('워크플로우 템플릿 목록 페이지', () => {
  installDomMeasurementStubs();

  it('목록을 렌더하고 이름을 상세 링크로, 생성자를 creator.name으로 표시한다', async () => {
    const { lastParams } = setupPagedTemplates();
    renderListPage(<WorkflowTemplatePage />);

    expect(await screen.findByRole('link', { name: '템플릿 01' })).toHaveAttribute(
      'href',
      '/workflow/templates/tpl-01'
    );
    expect(within(screen.getByTestId('row-0')).getByText('작성자01')).toBeInTheDocument();

    const params = lastParams();
    expect(params?.get('page')).toBe('1');
    expect(params?.get('sort')).toBe('name');
  });

  it('검색은 서버로 전달되지 않고(파라미터 없음 — 특성화) 클라이언트 필터로만 동작하며, 페이지는 1로 초기화된다', async () => {
    const { lastParams, requests } = setupPagedTemplates();
    const { user } = renderListPage(<WorkflowTemplatePage />);
    await screen.findByRole('link', { name: '템플릿 01' });

    await goToNextPage(user);
    expect(await screen.findByRole('link', { name: '템플릿 11' })).toBeInTheDocument();

    await searchListFor(user, '템플릿 03');

    // 검색어 입력 시 페이지네이션은 1로 초기화된다
    expect(await screen.findByRole('link', { name: '템플릿 03' })).toBeInTheDocument();
    await waitFor(() => expect(lastParams()?.get('page')).toBe('1'));
    expect(getPageIndexInput()).toHaveValue('1');

    // 서버 요청에는 search 파라미터가 실리지 않는다 — 1페이지 데이터가 클라이언트에서 걸러진 것
    expect(requests.every((params) => params.get('search') === null)).toBe(true);
    expect(screen.queryByRole('link', { name: '템플릿 01' })).not.toBeInTheDocument();
  });

  it('생성 클릭 시 생성 페이지로, 행 선택 후 수정 클릭 시 편집 페이지로 이동한다', async () => {
    setupPagedTemplates();
    const { user } = renderListPage(<WorkflowTemplatePage />);
    await screen.findByRole('link', { name: '템플릿 01' });

    await user.click(screen.getByRole('button', { name: '생성' }));
    expect(mockNavigate).toHaveBeenCalledWith('/workflow/templates/create');

    const editButton = screen.getByRole('button', { name: '수정' });
    expect(editButton).toBeDisabled();

    await toggleRowSelection(user, 0);
    await waitFor(() => expect(editButton).toBeEnabled());

    await user.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith('/workflow/templates/tpl-01/edit');
  });

  it('행 선택 → 삭제 확인 시 DELETE 요청을 보내고 선택을 해제한다(onDeleted 와이어링)', async () => {
    setupPagedTemplates();
    const deletedIds: string[] = [];
    server.use(
      http.delete(`${BASE_URL}/workflows/templates/:templateId`, ({ params }) => {
        deletedIds.push(params.templateId as string);
        return HttpResponse.json('deleted');
      })
    );
    const { user } = renderListPage(<WorkflowTemplatePage />);
    await screen.findByRole('link', { name: '템플릿 01' });

    const deleteButton = screen.getByRole('button', { name: '삭제' });
    expect(deleteButton).toBeDisabled();

    await toggleRowSelection(user, 0);
    await waitFor(() => expect(deleteButton).toBeEnabled());

    await user.click(deleteButton);
    expect(
      await screen.findByText('템플릿 01 템플릿을 삭제하시겠습니까?')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(await screen.findByText('템플릿 삭제 성공')).toBeInTheDocument();
    expect(deletedIds).toEqual(['tpl-01']);
    // onDeleted가 선택을 비우므로 삭제 버튼이 다시 비활성화된다
    await waitFor(() => expect(deleteButton).toBeDisabled());
  });

  it('데이터가 없으면 생성 안내 빈 상태를 보여준다', async () => {
    const { handler } = createPagedListHandler<WorkflowTemplateBrief>('workflows/templates', [], {
      envelope: (items, { total }) => ({ total, items }),
    });
    server.use(handler);
    renderListPage(<WorkflowTemplatePage />);

    expect(await screen.findByText('워크플로우 템플릿이 없습니다.')).toBeInTheDocument();
    expect(
      screen.getByText('생성 버튼을 클릭해 워크플로우 템플릿을 생성해 보세요.')
    ).toBeInTheDocument();
  });

  it('목록 조회가 실패하면 에러 문구를 보여준다', async () => {
    server.use(
      http.get(`${BASE_URL}/workflows/templates`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );
    renderListPage(<WorkflowTemplatePage />);

    expect(await screen.findByText('템플릿 목록을 불러오는 데 실패했습니다.')).toBeInTheDocument();
  });
});
