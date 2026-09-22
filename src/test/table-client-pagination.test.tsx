import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, useTablePagination } from '@innogrid/ui';
import { describe, expect, it } from 'vitest';
import { installDomMeasurementStubs } from './utils/dom-measure-stubs';

/**
 * Table 은 기본이 서버 페이지네이션이다.
 *
 * <p>전체 목록을 그대로 넘기면서 `useClientPagination` 을 빼면 2페이지로 넘어가도 화면이 바뀌지
 * 않는다. 목록이 10건을 넘는 순간부터 뒤쪽 행에 영영 닿지 못한다.
 */
const rows = Array.from({ length: 11 }, (_, i) => ({ id: `row-${i + 1}` }));
const columns = [{ accessorKey: 'id', header: 'ID' }];

function Fixture({ client }: { client: boolean }) {
  const { pagination, setPagination } = useTablePagination();
  return (
    <Table
      columns={columns}
      data={rows}
      totalCount={rows.length}
      pagination={pagination}
      setPagination={setPagination}
      useClientPagination={client}
    />
  );
}

describe('Table 페이지네이션', () => {
  // 가상 스크롤이라 jsdom 에서는 크기를 채워 주지 않으면 행이 하나도 그려지지 않는다.
  installDomMeasurementStubs();
  it('클라이언트 페이지네이션을 켜면 2페이지에서 나머지 행이 보인다', async () => {
    render(<Fixture client />);

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.queryByText('row-11')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('next-button'));

    expect(screen.getByText('row-11')).toBeInTheDocument();
    expect(screen.queryByText('row-1')).not.toBeInTheDocument();
  });

  it('끄면 2페이지로 가도 1페이지 행이 그대로 남는다', async () => {
    // 이 동작이 서버 페이지네이션의 계약이다 — data 가 이미 해당 페이지여야 한다.
    render(<Fixture client={false} />);

    await userEvent.click(screen.getByTestId('next-button'));

    expect(screen.getByText('row-1')).toBeInTheDocument();
  });
});
