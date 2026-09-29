import { describe, expect, it } from 'vitest';
import type { ChangeEvent } from 'react';
import { useListPageState } from './list-page';
import { act, createHookWrapper, renderHook } from '@/test/utils/test-utils';

describe('useListPageState', () => {
  it('기본 페이지를 API의 1페이지로 변환하고 정렬을 지정하지 않는다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    expect(result.current.queryParams).toEqual({
      page: 1,
      size: 10,
      search: '',
    });
    expect(result.current.queryParams).not.toHaveProperty('sort');
    expect(result.current.tableProps.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(result.current.tableProps.rowSelection).toEqual({});
    expect(result.current.tableProps.sorting).toBeUndefined();
    expect(result.current.tableProps.setSorting).toBeUndefined();
  });

  it('초기 페이지 크기와 다중 정렬의 순서 및 방향을 요청 파라미터에 반영한다', () => {
    const { result } = renderHook(
      () =>
        useListPageState({
          initialPagination: { pageIndex: 2, pageSize: 25 },
          initialSorting: [
            { id: 'name', desc: false },
            { id: 'created_at', desc: true },
          ],
        }),
      { wrapper: createHookWrapper() }
    );

    expect(result.current.queryParams).toEqual({
      page: 3,
      size: 25,
      search: '',
      sort: 'name,-created_at',
    });
    expect(result.current.tableProps.setSorting).toBeTypeOf('function');
  });

  it('입력 중에는 검색을 적용하지 않고 확정할 때 페이지와 선택을 초기화한다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => {
      result.current.tableProps.setPagination({ pageIndex: 2, pageSize: 25 });
      result.current.setRowSelection({ 0: true });
      result.current.searchInputProps.onChange({
        target: { value: '서비스' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.queryParams.search).toBe('');
    expect(result.current.queryParams.page).toBe(3);
    expect(result.current.tableProps.rowSelection).toEqual({ 0: true });

    act(() => result.current.searchInputProps.onSearch('서비스'));

    expect(result.current.queryParams).toMatchObject({ page: 1, size: 25, search: '서비스' });
    expect(result.current.tableProps.globalFilter).toBe('서비스');
    expect(result.current.tableProps.rowSelection).toEqual({});
  });

  it('검색을 지울 때 최초 검색 콜백도 현재 페이지 크기를 유지하고 선택을 해제한다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });
    // SearchInput의 초기화 버튼은 마운트 당시 콜백을 보관한다.
    const initialSearch = result.current.searchInputProps.onSearch;

    act(() => result.current.searchInputProps.onSearch('서비스'));
    act(() => {
      result.current.tableProps.setPagination({ pageIndex: 1, pageSize: 50 });
      result.current.setRowSelection({ 0: true });
    });
    act(() => initialSearch(''));

    expect(result.current.queryParams).toMatchObject({ page: 1, size: 50, search: '' });
    expect(result.current.tableProps.globalFilter).toBe('');
    expect(result.current.tableProps.rowSelection).toEqual({});
  });

  it('같은 검색어를 다시 확정하면 현재 페이지와 선택을 유지한다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => result.current.searchInputProps.onSearch('서비스'));
    act(() => {
      result.current.tableProps.setPagination({ pageIndex: 1, pageSize: 10 });
      result.current.setRowSelection({ 0: true });
    });
    act(() => result.current.searchInputProps.onSearch('서비스'));

    expect(result.current.queryParams).toMatchObject({ page: 2, search: '서비스' });
    expect(result.current.tableProps.rowSelection).toEqual({ 0: true });
  });

  it('함수형 페이지 변경 시 선택을 해제해 다음 페이지의 같은 인덱스를 선택하지 않는다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => result.current.setRowSelection({ 0: true }));
    act(() =>
      result.current.tableProps.setPagination((previous) => ({
        ...previous,
        pageIndex: previous.pageIndex + 1,
      }))
    );

    expect(result.current.queryParams.page).toBe(2);
    expect(result.current.tableProps.rowSelection).toEqual({});
    expect(result.current.getSelectedRow([{ id: '다음 페이지 첫 행' }])).toBeUndefined();
  });

  it('페이지 크기가 바뀌어도 이전 선택을 해제한다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => result.current.setRowSelection({ 0: true }));
    act(() => result.current.tableProps.setPagination({ pageIndex: 0, pageSize: 25 }));

    expect(result.current.queryParams.size).toBe(25);
    expect(result.current.tableProps.rowSelection).toEqual({});
  });

  it('정렬 변경 시 페이지 크기는 유지하고 첫 페이지와 빈 선택으로 돌아간다', () => {
    const { result } = renderHook(
      () => useListPageState({ initialSorting: [{ id: 'name', desc: false }] }),
      { wrapper: createHookWrapper() }
    );

    act(() => {
      result.current.tableProps.setPagination({ pageIndex: 2, pageSize: 25 });
      result.current.setRowSelection({ 0: true });
    });
    act(() =>
      result.current.tableProps.setSorting?.((previous) =>
        previous.map((sort) => ({ ...sort, desc: true }))
      )
    );

    expect(result.current.queryParams).toMatchObject({ page: 1, size: 25, sort: '-name' });
    expect(result.current.tableProps.rowSelection).toEqual({});

    act(() => result.current.tableProps.setSorting?.([]));
    expect(result.current.queryParams.sort).toBeUndefined();
  });

  it('false인 키를 제외하고 실제로 선택한 행 하나를 반환한다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });
    const rows = [{ id: '첫 행' }, { id: '둘째 행' }];

    act(() => result.current.setRowSelection({ 0: false, 1: true }));

    expect(result.current.getSelectedRow(rows)).toBe(rows[1]);
  });

  it.each<[string, Record<string, boolean>]>([
    ['선택 없음', {}],
    ['해제된 선택', { 0: false }],
    ['다중 선택', { 0: true, 1: true }],
    ['범위 밖 인덱스', { 2: true }],
    ['음수 인덱스', { '-1': true }],
    ['소수 인덱스', { '0.5': true }],
    ['숫자로 시작하는 문자열', { '0-invalid': true }],
    ['문자열 인덱스', { invalid: true }],
  ])('%s 상태에서는 행을 반환하지 않는다', (_, selection) => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => result.current.setRowSelection(selection));

    expect(result.current.getSelectedRow([{ id: '첫 행' }, { id: '둘째 행' }])).toBeUndefined();
  });

  it('선택 후 데이터가 비어도 존재하지 않는 행을 반환하지 않는다', () => {
    const { result } = renderHook(() => useListPageState(), {
      wrapper: createHookWrapper(),
    });

    act(() => result.current.setRowSelection({ 0: true }));

    expect(result.current.getSelectedRow([])).toBeUndefined();
  });
});
