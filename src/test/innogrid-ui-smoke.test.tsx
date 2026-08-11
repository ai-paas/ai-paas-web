/**
 * 인프라 스모크: 실제 @innogrid/ui 컴포넌트(Table/SearchInput/Select)가 jsdom에서
 * 렌더·상호작용 가능함을 보증한다. 이 테스트가 깨지면 vitest.config.ts의
 * server.deps.inline, setup-tests.ts의 전역 스텁, dom-measure-stubs 중 하나가 회귀한 것이다.
 * (컴포넌트 테스트에서 실제 라이브러리를 쓸지, 목을 쓸지는 src/test/README.md 참고)
 */
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  SearchInput,
  Select,
  HeaderCheckbox,
  CellCheckbox,
  useTableSelection,
  useTablePagination,
  useSearchInputState,
  type SortValue,
} from '@innogrid/ui';
import { installDomMeasurementStubs } from './utils/dom-measure-stubs';

type Row = { id: number; name: string };

const columns = [
  {
    id: 'select',
    size: 30,
    header: ({ table }: { table: Row }) => <HeaderCheckbox table={table} />,
    cell: ({ row }: { row: { original: Row } }) => <CellCheckbox row={row} />,
    enableSorting: false,
  },
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: Row) => row.name,
    size: 300,
  },
];

const data: Row[] = [
  { id: 1, name: '알파' },
  { id: 2, name: '베타' },
];

function TableFixture() {
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const [sorting, setSorting] = useState<SortValue[]>([{ id: 'name', desc: false }]);

  return (
    <div>
      <div data-testid="selected-count">{Object.keys(rowSelection).length}</div>
      <Table
        columns={columns}
        data={data}
        isLoading={false}
        emptyMessage="없음"
        totalCount={data.length}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
}

function SearchFixture() {
  const { searchValue, ...restProps } = useSearchInputState();
  return (
    <div>
      <div data-testid="search-value">{searchValue}</div>
      <SearchInput variant="default" placeholder="검색어를 입력해주세요" {...restProps} />
    </div>
  );
}

function SelectFixture() {
  const [value, setValue] = useState<{ text: string; value: string } | null>(null);
  const options = [
    { text: '옵션A', value: 'a' },
    { text: '옵션B', value: 'b' },
  ];
  return (
    <div>
      <div data-testid="select-value">{value?.value ?? 'none'}</div>
      <Select
        options={options}
        getOptionLabel={(o: { text: string; value: string }) => o.text}
        getOptionValue={(o: { text: string; value: string }) => o.value}
        value={value}
        onChange={(o: { text: string; value: string } | null) => setValue(o)}
      />
    </div>
  );
}

describe('innogrid-ui jsdom 스모크', () => {
  installDomMeasurementStubs();

  it('Table이 행을 렌더링하고 체크박스 선택이 동작한다', async () => {
    const user = userEvent.setup();
    render(<TableFixture />);

    expect(screen.getByText('알파')).toBeInTheDocument();
    expect(screen.getByText('베타')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(3); // header + rows

    await user.click(checkboxes[1]);
    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    });
  });

  it('SearchInput 입력이 useSearchInputState에 반영된다', async () => {
    const user = userEvent.setup();
    render(<SearchFixture />);

    const input = screen.getByPlaceholderText('검색어를 입력해주세요');
    await user.type(input, 'abc');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.getByTestId('search-value')).toHaveTextContent('abc');
    });
  });

  it('Select 옵션 선택이 동작한다', async () => {
    const user = userEvent.setup();
    render(<SelectFixture />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    const option = await screen.findByText('옵션A');
    await user.click(option);
    await waitFor(() => {
      expect(screen.getByTestId('select-value')).toHaveTextContent('a');
    });
  });
});
