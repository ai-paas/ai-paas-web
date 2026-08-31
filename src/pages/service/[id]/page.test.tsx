import { describe, expect, it, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { BASE_URL, mockServiceDetail } from '@/test/mocks/handlers';
import { renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import type {
  KnowledgeBaseSummary,
  ModelSummary,
  PromptSummary,
  ServiceDetail,
  ServiceMonitoringData,
} from '@/types/service';
import '@/test/mocks/innogrid-ui';

// 탭 5종은 부분 목킹 — 각 탭의 내부 동작은 개별 테스트가 담당하고,
// 여기서는 페이지가 서비스 상세 응답에서 올바른 데이터를 각 탭에 넘기는지만 검증한다.
vi.mock('@/components/features/service/workflow-tab', () => ({
  WorkflowTab: ({ serviceId }: { serviceId?: string }) => (
    <div data-testid="workflow-tab">{serviceId}</div>
  ),
}));
vi.mock('@/components/features/service/knowledge-base-tab', () => ({
  KnowledgeBaseTab: ({
    knowledgeBases,
    isLoading,
    isError,
  }: {
    knowledgeBases?: KnowledgeBaseSummary[];
    isLoading?: boolean;
    isError?: boolean;
  }) => (
    <div data-testid="knowledge-base-tab" data-loading={String(isLoading)} data-error={String(isError)}>
      {knowledgeBases?.map((kb) => kb.name).join(',')}
    </div>
  ),
}));
vi.mock('@/components/features/service/model-tab', () => ({
  ModelTab: ({ models, isError }: { models?: ModelSummary[]; isError?: boolean }) => (
    <div data-testid="model-tab" data-error={String(isError)}>
      {models?.map((model) => model.name).join(',')}
    </div>
  ),
}));
vi.mock('@/components/features/service/prompt-tab', () => ({
  PromptTab: ({ prompts, isError }: { prompts?: PromptSummary[]; isError?: boolean }) => (
    <div data-testid="prompt-tab" data-error={String(isError)}>
      {prompts?.map((prompt) => prompt.name).join(',')}
    </div>
  ),
}));
vi.mock('@/components/features/service/monitoring-tab', () => ({
  MonitoringTab: ({
    monitoringData,
    isError,
  }: {
    monitoringData?: ServiceMonitoringData | null;
    isError?: boolean;
  }) => (
    <div data-testid="monitoring-tab" data-error={String(isError)}>
      {monitoringData?.aggregated_at}
    </div>
  ),
}));

import ServiceDetailPage from './page';

const detailWithRelations: ServiceDetail = {
  ...mockServiceDetail,
  knowledge_bases: [
    {
      id: 17,
      surro_knowledge_id: 9001,
      name: 'KB-사내규정',
      description: null,
      type: 'vector',
      collection_name: 'kb-1',
      embedding_model_id: 1,
      search_method_id: 1,
      created_by: 'tester',
      created_at: '2024-01-05T00:00:00Z',
      workflow_refs: [],
    },
  ],
  models: [
    {
      id: 5,
      name: '모델-A',
      description: null,
      provider: 'openai',
      model_type: 'LLM',
      format: 'gguf',
      task: 'chat',
      visibility: 'public',
      created_at: '2024-01-05T00:00:00Z',
      workflow_refs: [],
    },
  ],
  prompts: [
    {
      id: 7,
      name: '프롬프트-B',
      description: null,
      content: '내용',
      variables: [],
      created_at: '2024-01-05T00:00:00Z',
      created_by: 'tester',
      workflow_refs: [],
    },
  ],
};

const renderPage = (route = '/service/srv-001') =>
  renderWithUser(<ServiceDetailPage />, { route, path: '/service/:id' });

describe('ServiceDetailPage', () => {
  describe('상세 정보', () => {
    it('서비스 상세 응답 값을 상세 정보 영역에 렌더링한다', async () => {
      renderPage();

      // 이름은 브레드크럼과 상세 정보 두 곳에 노출된다
      expect(await screen.findAllByText('테스트 서비스 1')).toHaveLength(2);
      // 생성일시·최근 업데이트가 KST로 포맷된다 (2024-01-01T00:00:00Z → 09:00)
      expect(screen.getAllByText('2024-01-01 09:00')).toHaveLength(2);
      expect(screen.getByText('tag1, tag2')).toBeInTheDocument();
      expect(screen.getByText('테스트 설명 1')).toBeInTheDocument();
    });

    it('로딩 중에는 값 5칸을 스켈레톤으로 표시한다', async () => {
      server.use(
        http.get(`${BASE_URL}/services/:surro_service_id`, async () => {
          await delay('infinite');
          return HttpResponse.json(mockServiceDetail);
        })
      );

      renderPage();

      expect(await screen.findAllByRole('status')).toHaveLength(5);
      expect(screen.queryByText('테스트 서비스 1')).not.toBeInTheDocument();
    });
  });

  describe('탭', () => {
    it('탭 5종 라벨을 렌더하고 기본 탭인 워크플로우 탭에 URL 파라미터의 serviceId를 전달한다', async () => {
      renderPage();

      expect(
        screen.getAllByRole('tab').map((tab) => tab.textContent)
      ).toEqual(['워크플로우', '지식 베이스', '모델', '프롬프트', '모니터링']);
      expect(screen.getByTestId('workflow-tab')).toHaveTextContent('srv-001');
      // 비활성 탭 내용은 마운트되지 않는다
      expect(screen.queryByTestId('model-tab')).not.toBeInTheDocument();
    });

    it('탭을 전환하면 각 탭에 서비스 상세 응답의 해당 데이터를 전달한다', async () => {
      server.use(
        http.get(`${BASE_URL}/services/:surro_service_id`, () =>
          HttpResponse.json(detailWithRelations)
        )
      );

      const { user } = renderPage();
      await screen.findAllByText('테스트 서비스 1');

      await user.click(screen.getByRole('tab', { name: '지식 베이스' }));
      expect(screen.getByTestId('knowledge-base-tab')).toHaveTextContent('KB-사내규정');

      await user.click(screen.getByRole('tab', { name: '모델' }));
      expect(screen.getByTestId('model-tab')).toHaveTextContent('모델-A');

      await user.click(screen.getByRole('tab', { name: '프롬프트' }));
      expect(screen.getByTestId('prompt-tab')).toHaveTextContent('프롬프트-B');

      await user.click(screen.getByRole('tab', { name: '모니터링' }));
      expect(screen.getByTestId('monitoring-tab')).toHaveTextContent('2024-01-31T00:00:00Z');
    });

    it('상세 조회가 실패하면 탭에 에러 상태를 전달한다', async () => {
      const { user } = renderPage('/service/srv-404');

      await user.click(screen.getByRole('tab', { name: '지식 베이스' }));

      await waitFor(() => {
        expect(screen.getByTestId('knowledge-base-tab')).toHaveAttribute('data-error', 'true');
      });
      expect(screen.queryByText('테스트 서비스 1')).not.toBeInTheDocument();
    });
  });
});
