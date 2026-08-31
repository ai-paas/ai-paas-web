import { ToastProvider } from '@innogrid/ui';
import { http, HttpResponse, type JsonBodyType } from 'msw';
import { BASE_URL } from '@/test/mocks/handlers/base';
import { renderWithUser, screen, userEvent, within } from './test-utils';
import type { ReactElement } from 'react';

/**
 * 목록 페이지(innogrid-ui Table + SearchInput) 통합 테스트 공용 헬퍼 (TEST_PLAN 3B).
 *
 * 실제 @innogrid/ui를 렌더하는 전제이므로 사용하는 테스트 파일에서
 * installDomMeasurementStubs()를 함께 호출할 것 (가상화 테이블이 크기 측정에 의존).
 * 경량 목(@/test/mocks/innogrid-ui)은 import하지 않는다.
 *
 * 가상화 주의: 스텁 뷰포트(500px) 기준으로 한 페이지에서 앞쪽 6행 정도만 DOM에 렌더된다.
 * 행 단언·선택은 각 페이지의 앞쪽 행으로 한정할 것.
 */

type UserEvent = ReturnType<typeof userEvent.setup>;

/** 목록 페이지 렌더 — 페이지 안의 CRUD 버튼들이 useToast를 쓰므로 ToastProvider로 감싼다 */
export function renderListPage(ui: ReactElement, options?: Parameters<typeof renderWithUser>[1]) {
  return renderWithUser(<ToastProvider>{ui}</ToastProvider>, options);
}

/** SearchInput에 검색어를 입력하고 Enter로 확정한다 (이 시점에 searchValue가 반영된다) */
export async function searchListFor(user: UserEvent, keyword: string) {
  const input = screen.getByPlaceholderText('검색어를 입력해주세요');
  await user.clear(input);
  await user.type(input, keyword);
  await user.keyboard('{Enter}');
}

/** 현재 페이지 번호 입력창 — 검색 시 1페이지로 초기화되는지 단언에 사용 */
export const getPageIndexInput = () => screen.getByTestId('page-index-input');

export async function goToNextPage(user: UserEvent) {
  await user.click(screen.getByTestId('next-button'));
}

/**
 * rowIndex번째(0부터) 데이터 행의 체크박스를 토글한다.
 * 가상화 이후 DOM 순서가 화면 순서와 일치하지 않을 수 있어 행 testid로 찾는다.
 *
 * 주의: Table의 행 클릭 핸들러가 체크박스 클릭에도 버블링되어, 다른 행이 선택된
 * 상태에서 클릭하면 선택이 "추가"되지 않고 "교체"된다 (개별 클릭 다중 선택 불가).
 * 여러 행 선택 상태를 만들려면 toggleSelectAll을 사용할 것.
 */
export async function toggleRowSelection(user: UserEvent, rowIndex: number) {
  await user.click(within(screen.getByTestId(`row-${rowIndex}`)).getByRole('checkbox'));
}

/** 헤더의 전체 선택 체크박스를 토글한다 — 다중 선택 상태를 만드는 유일한 경로 */
export async function toggleSelectAll(user: UserEvent) {
  await user.click(screen.getByTestId('header-checkbox'));
}

interface PagedListHandlerOptions<T> {
  /** 검색어 매칭 대상 문자열 추출. 기본: 아이템의 모든 문자열 값 결합 */
  searchText?: (item: T) => string;
  /** 정렬 키별 값 접근자. 기본: 아이템의 동명 프로퍼티 */
  sortAccessors?: Record<string, (item: T) => string | number>;
  /** 응답 봉투. 기본: Page<T> 형태({ data, total, page, size }) */
  envelope?: (slice: T[], ctx: { total: number; page: number; size: number }) => JsonBodyType;
}

const compareValues = (a: unknown, b: unknown) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'ko');
};

/**
 * page/size/search/sort 쿼리 파라미터를 실제 서버처럼 처리하는 목록 GET 핸들러 팩토리.
 * Table은 manualSorting/manualPagination 모드라 정렬·페이지 이동·검색이 전부
 * "요청 파라미터 변경"으로 나타난다 — requests/lastParams로 그 파라미터를 단언한다.
 */
export function createPagedListHandler<T extends object>(
  path: string,
  items: T[],
  options: PagedListHandlerOptions<T> = {}
) {
  const requests: URLSearchParams[] = [];

  const handler = http.get(`${BASE_URL}/${path}`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    requests.push(params);

    const page = Number(params.get('page')) || 1;
    const size = Number(params.get('size')) || 10;

    let result = items;

    const search = params.get('search');
    if (search) {
      const searchText =
        options.searchText ??
        ((item: T) =>
          Object.values(item)
            .filter((value): value is string => typeof value === 'string')
            .join(' '));
      result = result.filter((item) => searchText(item).includes(search));
    }

    const sortParam = params.get('sort')?.split(',')[0];
    if (sortParam) {
      const desc = sortParam.startsWith('-');
      const key = desc ? sortParam.slice(1) : sortParam;
      const accessor =
        options.sortAccessors?.[key] ??
        ((item: T) => (item as Record<string, unknown>)[key] as string | number);
      result = [...result].sort(
        (a, b) => compareValues(accessor(a), accessor(b)) * (desc ? -1 : 1)
      );
    }

    const total = result.length;
    const slice = result.slice((page - 1) * size, page * size);
    const body = options.envelope
      ? options.envelope(slice, { total, page, size })
      : ({ data: slice, total, page, size } as JsonBodyType);

    return HttpResponse.json(body);
  });

  return {
    handler,
    requests,
    /** 가장 최근 목록 요청의 쿼리 파라미터 */
    lastParams: () => requests.at(-1),
  };
}
