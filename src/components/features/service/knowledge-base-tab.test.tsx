import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/utils/test-utils';
import type { KnowledgeBaseSummary } from '@/types/service';
import type { ReactNode } from 'react';
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

describe('KnowledgeBaseTab', () => {
  it('내부 id가 아닌 surro_knowledge_id로 상세 링크를 만든다', () => {
    render(<KnowledgeBaseTab knowledgeBases={[knowledgeBase]} />);

    const link = screen.getByRole('link', { name: knowledgeBase.name });

    expect(link).toHaveAttribute('href', `/knowledge-base/${knowledgeBase.surro_knowledge_id}`);
    expect(link).not.toHaveAttribute('href', `/knowledge-base/${knowledgeBase.id}`);
  });
});
