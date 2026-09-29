import { BreadCrumb, SearchInput, Table, type SortValue, type TableProps } from '@innogrid/ui';
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { getServerErrorMessage } from '@/lib/api';

// UI 킷의 페이지·선택 타입은 미배포된 @tanstack/react-table을 참조한다.
// 같은 구조를 명시해 함수형 setter의 인자 타입이 any로 소실되지 않도록 한다.
interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

type RowSelection = Record<string, boolean>;

interface ListPageStateOptions {
  initialPagination?: PaginationState;
  // 서버 정렬을 지원하는 목록에서만 지정한다. 빈 배열은 초기 정렬 없는 제어 모드다.
  initialSorting?: SortValue[];
}

interface ListPageState {
  pagination: PaginationState;
  searchValue: string;
  sorting: SortValue[];
  rowSelection: RowSelection;
}

export const useListPageState = ({
  initialPagination = { pageIndex: 0, pageSize: 10 },
  initialSorting,
}: ListPageStateOptions = {}) => {
  const [value, setValue] = useState('');
  const [state, setState] = useState<ListPageState>(() => ({
    pagination: initialPagination,
    searchValue: '',
    sorting: initialSorting ?? [],
    rowSelection: {},
  }));
  const { pagination, searchValue, sorting, rowSelection } = state;

  const setPagination = useCallback((update: SetStateAction<PaginationState>) => {
    setState((previous) => {
      const next = typeof update === 'function' ? update(previous.pagination) : update;
      if (
        next.pageIndex === previous.pagination.pageIndex &&
        next.pageSize === previous.pagination.pageSize
      ) {
        return previous;
      }
      return { ...previous, pagination: next, rowSelection: {} };
    });
  }, []);

  const setSorting = useCallback((update: SetStateAction<SortValue[]>) => {
    setState((previous) => ({
      ...previous,
      sorting: typeof update === 'function' ? update(previous.sorting) : update,
      pagination: { ...previous.pagination, pageIndex: 0 },
      rowSelection: {},
    }));
  }, []);

  const setRowSelection = useCallback((update: SetStateAction<RowSelection>) => {
    setState((previous) => {
      const next = typeof update === 'function' ? update(previous.rowSelection) : update;
      if (!Object.keys(next).length && !Object.keys(previous.rowSelection).length) return previous;
      return { ...previous, rowSelection: next };
    });
  }, []);

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  // 검색어와 페이지를 한 번에 갱신해 새 검색어로 이전 페이지를 요청하지 않는다.
  // 초기화 버튼도 이 콜백을 쓰므로 빈 검색어로 돌아갈 때도 첫 페이지부터 조회한다.
  const onSearch = useCallback((search: string) => {
    setState((previous) =>
      previous.searchValue === search
        ? previous
        : {
            ...previous,
            searchValue: search,
            pagination: { ...previous.pagination, pageIndex: 0 },
            rowSelection: {},
          }
    );
  }, []);

  const sort = useMemo(
    () => sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',') || undefined,
    [sorting]
  );
  const selectedRowKeys = useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]),
    [rowSelection]
  );

  // Table 기본 행 키(현재 페이지의 인덱스)를 사용한다. 다중 선택은 CRUD 대상이 아니다.
  const getSelectedRow = <T,>(rows: readonly T[]): T | undefined => {
    if (selectedRowKeys.length !== 1) return undefined;
    const key = selectedRowKeys[0];
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || String(index) !== key) return undefined;
    return rows[index];
  };

  return {
    queryParams: {
      page: pagination.pageIndex + 1,
      size: pagination.pageSize,
      search: searchValue,
      ...(initialSorting !== undefined ? { sort } : {}),
    },
    searchInputProps: { value, onChange, onSearch },
    tableProps: {
      pagination,
      setPagination,
      rowSelection,
      setRowSelection,
      globalFilter: searchValue,
      ...(initialSorting !== undefined ? { sorting, setSorting } : {}),
    },
    selectedRowKeys,
    getSelectedRow,
    setRowSelection,
  };
};

type ListState = ReturnType<typeof useListPageState>;

type ListPageProps<T> = Omit<
  TableProps<T>,
  'emptyMessage' | 'errorMessage' | keyof ListState['tableProps']
> & {
  title: string;
  breadcrumbItems?: ComponentProps<typeof BreadCrumb>['items'];
  actions: ReactNode;
  listState: ListState;
  error?: unknown;
  errorMessage: string;
  emptyTitle: string;
  emptyDescription?: string;
};

const ListPageMessage = ({ title, description }: { title: ReactNode; description?: ReactNode }) => (
  <div className="flex flex-col items-center gap-4">
    <div>{title}</div>
    {description && <div>{description}</div>}
  </div>
);

export const ListPage = <T,>({
  title,
  breadcrumbItems = [{ label: title }],
  actions,
  listState,
  error,
  errorMessage,
  emptyTitle,
  emptyDescription,
  emptySearchMessage = (
    <ListPageMessage
      title="검색 결과가 없습니다."
      description="검색 필터 또는 검색 조건을 변경해 보세요."
    />
  ),
  ...tableProps
}: ListPageProps<T>) => (
  <main>
    <div className="breadcrumbBox">
      <BreadCrumb items={breadcrumbItems} />
    </div>
    <div className="page-title-box">
      <h2 className="page-title">{title}</h2>
    </div>
    <div className="page-content">
      <div className="page-toolBox">
        <div className="page-toolBox-btns">{actions}</div>
        <div>
          <SearchInput
            variant="default"
            placeholder="검색어를 입력해주세요"
            {...listState.searchInputProps}
          />
        </div>
      </div>
      <div className="h-120.25">
        <Table
          {...tableProps}
          {...listState.tableProps}
          emptySearchMessage={emptySearchMessage}
          emptyMessage={<ListPageMessage title={emptyTitle} description={emptyDescription} />}
          // isError를 별도로 전달해 검색 중 실패도 검색 결과 없음보다 우선 표시한다.
          errorMessage={getServerErrorMessage(error, errorMessage)}
        />
      </div>
    </div>
  </main>
);
