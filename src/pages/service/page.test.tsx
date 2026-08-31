/**
 * 서비스 목록 페이지 통합 테스트 (TEST_PLAN 3B — 목록 페이지 패턴의 기준 템플릿).
 *
 * 실제 @innogrid/ui Table/SearchInput을 렌더한다. Table은 manualSorting/manualPagination
 * 모드라 검색·정렬·페이지 이동이 전부 서버 요청 파라미터 변경으로 나타나므로,
 * createPagedListHandler(list-page 헬퍼)로 서버 페이징을 흉내 내고 파라미터를 단언한다.
 */
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { http, HttpResponse } from 'msw';
import ServicePage from './page';
import { server } from '@/test/mocks/server';
import { BASE_URL, mockServices } from '@/test/mocks/handlers';
import { installDomMeasurementStubs } from '@/test/utils/dom-measure-stubs';
import {
  createPagedListHandler,
  getPageIndexInput,
  goToNextPage,
  renderListPage,
  searchListFor,
  toggleRowSelection,
  toggleSelectAll,
} from '@/test/utils/list-page';
import { screen, waitFor } from '@/test/utils/test-utils';
import type { Service } from '@/types/service';

const pad = (n: number) => String(n).padStart(2, '0');

// 12개 = 2페이지(size 10) — 페이지 이동·검색 시 페이지네이션 초기화 검증용
const services: Service[] = Array.from({ length: 12 }, (_, i) => ({
  ...mockServices[0],
  id: i + 1,
  surro_service_id: `srv-${pad(i + 1)}`,
  name: `서비스 ${pad(i + 1)}`,
  description: `설명 ${i + 1}`,
  tags: [`tag${i + 1}`],
  created_by: `user${i + 1}`,
}));

const setupPagedServices = () => {
  const paged = createPagedListHandler('services', services);
  server.use(paged.handler);
  return paged;
};

describe('서비스 목록 페이지', () => {
  installDomMeasurementStubs();

  it('목록을 렌더하고 이름을 상세 링크로 연결하며, 기본 정렬(name 오름차순)로 요청한다', async () => {
    const { lastParams } = setupPagedServices();
    renderListPage(<ServicePage />);

    expect(await screen.findByRole('link', { name: '서비스 01' })).toHaveAttribute(
      'href',
      '/service/srv-01'
    );

    const params = lastParams();
    expect(params?.get('page')).toBe('1');
    expect(params?.get('size')).toBe('10');
    expect(params?.get('sort')).toBe('name');
  });

  it('이름 헤더를 클릭하면 내림차순(-name)으로 재요청하고 첫 행이 바뀐다', async () => {
    const { lastParams } = setupPagedServices();
    const { user } = renderListPage(<ServicePage />);
    await screen.findByRole('link', { name: '서비스 01' });

    await user.click(screen.getByText('이름'));

    expect(await screen.findByRole('link', { name: '서비스 12' })).toBeInTheDocument();
    expect(lastParams()?.get('sort')).toBe('-name');
    // 내림차순 1페이지는 12~03 — 01은 2페이지로 밀려난다
    expect(screen.queryByRole('link', { name: '서비스 01' })).not.toBeInTheDocument();
  });

  it('2페이지에서 검색하면 1페이지로 초기화되고 search 파라미터가 실린다', async () => {
    const { lastParams } = setupPagedServices();
    const { user } = renderListPage(<ServicePage />);
    await screen.findByRole('link', { name: '서비스 01' });

    await goToNextPage(user);
    expect(await screen.findByRole('link', { name: '서비스 11' })).toBeInTheDocument();
    expect(lastParams()?.get('page')).toBe('2');

    await searchListFor(user, '서비스 03');

    expect(await screen.findByRole('link', { name: '서비스 03' })).toBeInTheDocument();
    await waitFor(() => {
      const params = lastParams();
      expect(params?.get('page')).toBe('1');
      expect(params?.get('search')).toBe('서비스 03');
    });
    expect(getPageIndexInput()).toHaveValue('1');
    expect(screen.queryByRole('link', { name: '서비스 11' })).not.toBeInTheDocument();
  });

  it('검색 결과가 없으면 검색 전용 빈 상태 문구를 보여준다', async () => {
    setupPagedServices();
    const { user } = renderListPage(<ServicePage />);
    await screen.findByRole('link', { name: '서비스 01' });

    await searchListFor(user, '존재하지 않는 서비스');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('검색 필터 또는 검색 조건을 변경해 보세요.')).toBeInTheDocument();
  });

  it('행을 하나 선택하면 편집/삭제가 활성화되고, 전체 선택하면 다시 비활성화된다(단일 선택 규칙)', async () => {
    setupPagedServices();
    const { user } = renderListPage(<ServicePage />);
    await screen.findByRole('link', { name: '서비스 01' });

    const editButton = screen.getByRole('button', { name: '편집' });
    const deleteButton = screen.getByRole('button', { name: '삭제' });
    expect(screen.getByRole('button', { name: '생성' })).toBeEnabled();
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();

    await toggleRowSelection(user, 0);
    await waitFor(() => expect(editButton).toBeEnabled());
    expect(deleteButton).toBeEnabled();

    // 다른 행 체크박스를 클릭하면 선택이 교체(추가 아님)되어 여전히 활성 상태다
    // — Table 행 클릭 핸들러의 단일 선택 동작 특성화 (list-page.tsx 참고)
    await toggleRowSelection(user, 1);
    await waitFor(() => expect(editButton).toBeEnabled());

    // 여러 행이 선택되는 유일한 경로인 헤더 전체 선택 시 단일 선택 규칙으로 비활성화된다
    await toggleSelectAll(user);
    await waitFor(() => expect(editButton).toBeDisabled());
    expect(deleteButton).toBeDisabled();
  });

  it('데이터가 없으면 생성 안내 빈 상태를 보여준다', async () => {
    const { handler } = createPagedListHandler<Service>('services', []);
    server.use(handler);
    renderListPage(<ServicePage />);

    expect(await screen.findByText('서비스가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('생성 버튼을 클릭해 서비스를 생성해 보세요.')).toBeInTheDocument();
  });

  it('접근성 스모크: axe 위반이 업스트림 Table 내부 요소에 국한된다 — 버그 의심: 팀 확인 필요', async () => {
    setupPagedServices();
    const { container } = renderListPage(<ServicePage />);
    await screen.findByRole('link', { name: '서비스 01' });

    // color-contrast는 jsdom(canvas 미구현)에서 판정 불가 — 명시적으로 제외
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });

    // 현재 위반 3종은 전부 @innogrid/ui Table 내부(업스트림, 부록 A 참고):
    // button-name(행·헤더 체크박스와 페이지네이션 이전/다음 버튼에 접근 가능한 이름 없음),
    // label(페이지 인덱스 입력), select-name(페이지 크기 셀렉터).
    // 업스트림 수정 시 이 기대값을 []로 갱신할 것.
    expect([...new Set(results.violations.map((v) => v.id))].sort()).toEqual([
      'button-name',
      'label',
      'select-name',
    ]);

    // 위반 노드가 전부 알려진 업스트림 요소인지 고정 — 같은 규칙이라도
    // 페이지 자체 마크업에서 새 위반이 생기면 여기서 실패한다.
    const isUpstreamTableTarget = (target: string) =>
      /select-all|checkbox-\d+|prev-button|next-button|page-index-input/.test(target) ||
      target === 'select';
    const pageOwnedTargets = results.violations
      .flatMap((v) => v.nodes.map((n) => String(n.target)))
      .filter((target) => !isUpstreamTableTarget(target));
    expect(pageOwnedTargets).toEqual([]);
  });

  it('목록 조회가 실패하면 에러 문구를 보여준다', async () => {
    server.use(
      http.get(`${BASE_URL}/services`, () =>
        HttpResponse.json({ message: 'error' }, { status: 500 })
      )
    );
    renderListPage(<ServicePage />);

    expect(
      await screen.findByText('서비스 목록을 불러오는 데 실패했습니다.')
    ).toBeInTheDocument();
  });
});
