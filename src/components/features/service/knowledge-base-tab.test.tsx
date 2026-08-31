import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithUser } from '@/test/utils/test-utils';
import type { KnowledgeBaseSummary } from '@/types/service';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { KnowledgeBaseTab } from './knowledge-base-tab';

interface MockColumn {
  id?: string;
  cell?: (props: { row: { original: KnowledgeBaseSummary } }) => ReactNode;
}

vi.mock('@innogrid/ui', () => ({
  useTablePagination: () => ({
    pagination: { pageIndex: 0, pageSize: 10 },
    setPagination: vi.fn(),
  }),
  Table: ({ columns, data }: { columns: MockColumn[]; data: KnowledgeBaseSummary[] }) => {
    const nameColumn = columns.find((column) => column.id === 'name');

    return (
      <>
        {data.map((item) => (
          <div key={item.id}>{nameColumn?.cell?.({ row: { original: item } })}</div>
        ))}
      </>
    );
  },
}));

const knowledgeBase: KnowledgeBaseSummary = {
  id: 17,
  surro_knowledge_id: 9001,
  name: '사내 규정',
  description: '2026년 개정판',
  type: 'vector',
  collection_name: 'company-policy',
  embedding_model_id: 13,
  search_method_id: 1,
  created_by: 'tester',
  created_at: '2026-08-14T00:00:00Z',
  workflow_refs: [],
};

const LocationProbe = () => <div data-testid="current-location">{useLocation().pathname}</div>;

describe('KnowledgeBaseTab', () => {
  it('서비스 상세 응답의 id로 상세 링크를 만들고 클릭하면 이동한다', async () => {
    const { user } = renderWithUser(
      <>
        <KnowledgeBaseTab knowledgeBases={[knowledgeBase]} />
        <LocationProbe />
      </>,
      { route: '/service/service-1' }
    );

    const link = screen.getByRole('link', { name: knowledgeBase.name });

    expect(link).toHaveAttribute('href', `/knowledge-base/${knowledgeBase.id}`);
    expect(link).not.toHaveAttribute('href', `/knowledge-base/${knowledgeBase.surro_knowledge_id}`);

    await user.click(link);

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      `/knowledge-base/${knowledgeBase.id}`
    );
  });
});
