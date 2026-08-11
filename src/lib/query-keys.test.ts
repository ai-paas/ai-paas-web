import { QueryClient, hashKey } from '@tanstack/react-query';
import { describe, it, expect } from 'vitest';
import { queryKeys } from './query-keys';

// 렌더 없이 캐시에 쿼리를 심는다 — setQueryData만으로 QueryCache에 엔트리가 생성된다.
const seed = (client: QueryClient, key: readonly unknown[]) => {
  client.setQueryData(key, 'cached');
};

const isInvalidated = (client: QueryClient, key: readonly unknown[]) =>
  client.getQueryState(key)?.isInvalidated;

describe('queryKeys', () => {
  // ============================================
  // models 캐시 계층 (a3dd1d4 회귀 방지)
  // ============================================
  describe('models 캐시 계층', () => {
    it('detail(id)는 [models, detail, id] 형태로 models.all의 하위 prefix를 유지한다', () => {
      expect(queryKeys.models.detail(42)).toStrictEqual(['models', 'detail', 42]);
      expect(queryKeys.models.detail(42).slice(0, 1)).toStrictEqual([...queryKeys.models.all]);
    });

    it('models.all 무효화 시 detail/list 쿼리가 부분 일치로 함께 무효화된다', async () => {
      const client = new QueryClient();
      seed(client, queryKeys.models.detail(1));
      seed(client, queryKeys.models.list({ page: 1 }));
      seed(client, queryKeys.prompts.detail(1)); // 무관 네임스페이스 — 휩쓸리면 안 된다

      await client.invalidateQueries({ queryKey: queryKeys.models.all });

      expect(isInvalidated(client, queryKeys.models.detail(1))).toBe(true);
      expect(isInvalidated(client, queryKeys.models.list({ page: 1 }))).toBe(true);
      expect(isInvalidated(client, queryKeys.prompts.detail(1))).toBe(false);
    });
  });

  // ============================================
  // prompts 캐시 계층 (a3dd1d4 회귀 방지)
  // ============================================
  describe('prompts 캐시 계층', () => {
    it('detail(id)는 [prompts, detail, id] 형태로 prompts.all의 하위 prefix를 유지한다', () => {
      expect(queryKeys.prompts.detail(7)).toStrictEqual(['prompts', 'detail', 7]);
      expect(queryKeys.prompts.detail(7).slice(0, 1)).toStrictEqual([...queryKeys.prompts.all]);
    });

    it('prompts.all 무효화 시 detail/list/variableTypes 쿼리가 함께 무효화된다', async () => {
      const client = new QueryClient();
      seed(client, queryKeys.prompts.detail(7));
      seed(client, queryKeys.prompts.list({ page: 1, size: 10 }));
      seed(client, queryKeys.prompts.variableTypes());
      seed(client, queryKeys.models.detail(7)); // 무관 네임스페이스

      await client.invalidateQueries({ queryKey: queryKeys.prompts.all });

      expect(isInvalidated(client, queryKeys.prompts.detail(7))).toBe(true);
      expect(isInvalidated(client, queryKeys.prompts.list({ page: 1, size: 10 }))).toBe(true);
      expect(isInvalidated(client, queryKeys.prompts.variableTypes())).toBe(true);
      expect(isInvalidated(client, queryKeys.models.detail(7))).toBe(false);
    });
  });

  // ============================================
  // workflows / templates 키 충돌 방지 (a3dd1d4 핵심: 캐시 충돌)
  // ============================================
  describe('workflows / templates 키 충돌 방지', () => {
    it.each<[string | undefined, number | string | undefined]>([
      ['1', 1],
      ['1', '1'],
      ['detail', 'detail'],
      ['templates', 'templates'],
      ['tpl-abc', 'tpl-abc'],
      [undefined, undefined],
    ])(
      'templates.detail(%s)과 workflows.detail(%s)은 같은 키를 생성하지 않는다',
      (templateId, workflowId) => {
        const templateKey = queryKeys.workflows.templates.detail(templateId);
        const workflowKey = queryKeys.workflows.detail(workflowId);

        expect(hashKey(templateKey)).not.toBe(hashKey(workflowKey));
        expect(templateKey).not.toStrictEqual(workflowKey);
      }
    );

    it('templates.all은 workflows.all의 하위 prefix다 — workflows.all 무효화 시 템플릿 쿼리도 무효화된다', async () => {
      const client = new QueryClient();
      seed(client, queryKeys.workflows.templates.list({ page: 1 }));
      seed(client, queryKeys.workflows.templates.detail('tpl-1'));
      seed(client, queryKeys.workflows.detail(9));

      await client.invalidateQueries({ queryKey: queryKeys.workflows.all });

      expect(isInvalidated(client, queryKeys.workflows.templates.list({ page: 1 }))).toBe(true);
      expect(isInvalidated(client, queryKeys.workflows.templates.detail('tpl-1'))).toBe(true);
      expect(isInvalidated(client, queryKeys.workflows.detail(9))).toBe(true);
    });

    it('templates.all 무효화는 일반 workflow detail/list 쿼리를 무효화하지 않는다', async () => {
      const client = new QueryClient();
      seed(client, queryKeys.workflows.templates.detail('tpl-1'));
      seed(client, queryKeys.workflows.detail(9));
      seed(client, queryKeys.workflows.list({ page: 1 }));

      await client.invalidateQueries({ queryKey: queryKeys.workflows.templates.all });

      expect(isInvalidated(client, queryKeys.workflows.templates.detail('tpl-1'))).toBe(true);
      expect(isInvalidated(client, queryKeys.workflows.detail(9))).toBe(false);
      expect(isInvalidated(client, queryKeys.workflows.list({ page: 1 }))).toBe(false);
    });

    // 버그 의심 — 팀 확인 필요:
    // workflows.detail은 ['workflows', wid] 형태로 'detail' 구분 세그먼트가 없어,
    // wid가 예약 세그먼트('templates'/'status'/'models'/'finalize-cleanup'/'component-types')와
    // 같은 문자열이면 하위 네임스페이스 키 공간과 충돌한다.
    // 실제 workflow id가 숫자/UUID라면 발현하지 않지만 타입상 string이 허용된다.
    describe('특성화: workflows.detail(wid)의 예약 세그먼트 충돌 (버그 의심 — 팀 확인 필요)', () => {
      it('workflows.detail("templates")는 templates.all과 완전히 동일한 키가 된다', () => {
        expect(hashKey(queryKeys.workflows.detail('templates'))).toBe(
          hashKey(queryKeys.workflows.templates.all)
        );
      });

      it('id가 "templates"인 workflow detail 쿼리는 templates.all 무효화에 휩쓸린다', async () => {
        const client = new QueryClient();
        seed(client, queryKeys.workflows.detail('templates'));

        await client.invalidateQueries({ queryKey: queryKeys.workflows.templates.all });

        expect(isInvalidated(client, queryKeys.workflows.detail('templates'))).toBe(true);
      });

      it('workflows.detail("status") 키로 무효화하면 모든 workflows.status 쿼리가 휩쓸린다', async () => {
        const client = new QueryClient();
        seed(client, queryKeys.workflows.status('wf-1'));
        seed(client, queryKeys.workflows.status('wf-2'));

        await client.invalidateQueries({ queryKey: queryKeys.workflows.detail('status') });

        expect(isInvalidated(client, queryKeys.workflows.status('wf-1'))).toBe(true);
        expect(isInvalidated(client, queryKeys.workflows.status('wf-2'))).toBe(true);
      });
    });
  });

  // ============================================
  // 네임스페이스 루트(all) 시그니처 전수 검증
  // ============================================
  describe('네임스페이스 루트 키', () => {
    it.each<[string, readonly unknown[], readonly unknown[]]>([
      ['dashboard.all', queryKeys.dashboard.all, ['dashboard']],
      ['datasets.all', queryKeys.datasets.all, ['datasets']],
      ['knowledgeBases.all', queryKeys.knowledgeBases.all, ['knowledge-bases']],
      ['knowledgeBaseMeta.chunkTypes', queryKeys.knowledgeBaseMeta.chunkTypes, ['chunk-types']],
      ['knowledgeBaseMeta.languages', queryKeys.knowledgeBaseMeta.languages, ['languages']],
      [
        'knowledgeBaseMeta.searchMethods',
        queryKeys.knowledgeBaseMeta.searchMethods,
        ['search-methods'],
      ],
      ['members.all', queryKeys.members.all, ['members']],
      ['models.all', queryKeys.models.all, ['models']],
      ['customModels.all', queryKeys.customModels.all, ['custom-models']],
      ['modelCatalogs.all', queryKeys.modelCatalogs.all, ['model-catalogs']],
      ['modelProviders.all', queryKeys.modelProviders.all, ['providers']],
      ['modelTypes.all', queryKeys.modelTypes.all, ['model-types']],
      ['modelFormats.all', queryKeys.modelFormats.all, ['model-formats']],
      ['hubModels.all', queryKeys.hubModels.all, ['hub-connect']],
      ['hubModelTags.all', queryKeys.hubModelTags.all, ['hub-connect-tags']],
      ['modelImprovements.all', queryKeys.modelImprovements.all, ['model-improvements']],
      ['prompts.all', queryKeys.prompts.all, ['prompts']],
      ['services.all', queryKeys.services.all, ['services']],
      ['learning.all', queryKeys.learning.all, ['learning']],
      ['workflows.all', queryKeys.workflows.all, ['workflows']],
      ['workflows.templates.all', queryKeys.workflows.templates.all, ['workflows', 'templates']],
    ])('%s 는 예상 루트 키와 일치한다', (_name, actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  // ============================================
  // 키 팩토리 시그니처 전수 검증
  // ============================================
  describe('키 팩토리 시그니처', () => {
    it.each<[string, readonly unknown[], readonly unknown[]]>([
      // dashboard
      ['dashboard.summary()', queryKeys.dashboard.summary(), ['dashboard', 'summary']],
      ['dashboard.meSummary()', queryKeys.dashboard.meSummary(), ['dashboard', 'me', 'summary']],
      [
        'dashboard.meServices()',
        queryKeys.dashboard.meServices(),
        ['dashboard', 'me', 'services'],
      ],
      [
        'dashboard.meMonitoring() 기본값',
        queryKeys.dashboard.meMonitoring(),
        ['dashboard', 'me', 'monitoring', {}],
      ],
      [
        'dashboard.meActivities() 기본값',
        queryKeys.dashboard.meActivities(),
        ['dashboard', 'me', 'activities', {}],
      ],
      [
        'dashboard.topUsers({ domain, size })',
        queryKeys.dashboard.topUsers({ domain: 'model', size: 3 }),
        ['dashboard', 'users', 'top', { domain: 'model', size: 3 }],
      ],
      [
        'dashboard.infraStatus()',
        queryKeys.dashboard.infraStatus(),
        ['dashboard', 'infra', 'status'],
      ],
      [
        'dashboard.infraNodes({ cluster })',
        queryKeys.dashboard.infraNodes({ cluster: 'c1' }),
        ['dashboard', 'infra', 'nodes', { cluster: 'c1' }],
      ],
      [
        'dashboard.infraResources({ cluster, resource_type })',
        queryKeys.dashboard.infraResources({ cluster: 'c1', resource_type: 'cpu' }),
        ['dashboard', 'infra', 'resources', { cluster: 'c1', resource_type: 'cpu' }],
      ],
      ['dashboard.events() 기본값', queryKeys.dashboard.events(), ['dashboard', 'events', {}]],
      ['dashboard.trends() 기본값', queryKeys.dashboard.trends(), ['dashboard', 'trends', {}]],
      [
        'dashboard.apiMetrics() 기본값',
        queryKeys.dashboard.apiMetrics(),
        ['dashboard', 'api-metrics', {}],
      ],
      [
        'dashboard.providersHealth() 기본값',
        queryKeys.dashboard.providersHealth(),
        ['dashboard', 'providers', 'health', {}],
      ],
      // datasets
      ['datasets.list() 기본값', queryKeys.datasets.list(), ['datasets', {}]],
      [
        'datasets.list({ page, size })',
        queryKeys.datasets.list({ page: 1, size: 10 }),
        ['datasets', { page: 1, size: 10 }],
      ],
      ['datasets.detail(3)', queryKeys.datasets.detail(3), ['datasets', 3]],
      ['datasets.detail(undefined)', queryKeys.datasets.detail(undefined), ['datasets', undefined]],
      ['datasets.kinds()', queryKeys.datasets.kinds(), ['datasets', 'kinds']],
      // knowledgeBases
      ['knowledgeBases.list() 기본값', queryKeys.knowledgeBases.list(), ['knowledge-bases', {}]],
      ['knowledgeBases.detail(2)', queryKeys.knowledgeBases.detail(2), ['knowledge-bases', 2]],
      [
        'knowledgeBases.files(2) — detail(2) 하위 prefix',
        queryKeys.knowledgeBases.files(2),
        ['knowledge-bases', 2, 'files'],
      ],
      [
        'knowledgeBases.searchRecords(2) — detail(2) 하위 prefix',
        queryKeys.knowledgeBases.searchRecords(2),
        ['knowledge-bases', 2, 'search-records'],
      ],
      // members
      ['members.list() 기본값', queryKeys.members.list(), ['members', {}]],
      ['members.detail("m-1")', queryKeys.members.detail('m-1'), ['members', 'm-1']],
      // models 계열
      ['models.list() 기본값', queryKeys.models.list(), ['models', {}]],
      ['models.detail(1)', queryKeys.models.detail(1), ['models', 'detail', 1]],
      ['customModels.list() 기본값', queryKeys.customModels.list(), ['custom-models', {}]],
      ['modelCatalogs.list() 기본값', queryKeys.modelCatalogs.list(), ['model-catalogs', {}]],
      ['modelProviders.list() 기본값', queryKeys.modelProviders.list(), ['providers', {}]],
      ['modelTypes.list() 기본값', queryKeys.modelTypes.list(), ['model-types', {}]],
      ['modelFormats.list() 기본값', queryKeys.modelFormats.list(), ['model-formats', {}]],
      [
        'hubModels.list({ market })',
        queryKeys.hubModels.list({ market: 'huggingface' }),
        ['hub-connect', { market: 'huggingface' }],
      ],
      [
        'hubModelTags.list({ group, market })',
        queryKeys.hubModelTags.list({ group: 'task', market: 'huggingface' }),
        ['hub-connect-tags', { group: 'task', market: 'huggingface' }],
      ],
      [
        'modelImprovements.taskTypes() 기본값',
        queryKeys.modelImprovements.taskTypes(),
        ['model-improvements', 'task-types', {}],
      ],
      [
        'modelImprovements.status("t-1")',
        queryKeys.modelImprovements.status('t-1'),
        ['model-improvements', 'status', 't-1'],
      ],
      // prompts
      ['prompts.list() 기본값', queryKeys.prompts.list(), ['prompts', {}]],
      ['prompts.detail(7)', queryKeys.prompts.detail(7), ['prompts', 'detail', 7]],
      [
        'prompts.variableTypes()',
        queryKeys.prompts.variableTypes(),
        ['prompts', 'variable-types'],
      ],
      // services
      ['services.list() 기본값', queryKeys.services.list(), ['services', {}]],
      ['services.detail("srv-1")', queryKeys.services.detail('srv-1'), ['services', 'srv-1']],
      // learning
      ['learning.list() 기본값', queryKeys.learning.list(), ['learning', {}]],
      ['learning.detail(11)', queryKeys.learning.detail(11), ['learning', 11]],
      ['learning.status(11)', queryKeys.learning.status(11), ['learning', 'status', 11]],
      // workflows
      [
        'workflows.list({ page })',
        queryKeys.workflows.list({ page: 1 }),
        ['workflows', { page: 1 }],
      ],
      ['workflows.detail(9) — 숫자 id', queryKeys.workflows.detail(9), ['workflows', 9]],
      [
        'workflows.detail("wf-1") — 문자열 id',
        queryKeys.workflows.detail('wf-1'),
        ['workflows', 'wf-1'],
      ],
      [
        'workflows.componentTypes()',
        queryKeys.workflows.componentTypes(),
        ['workflows', 'component-types'],
      ],
      [
        'workflows.status("wf-1")',
        queryKeys.workflows.status('wf-1'),
        ['workflows', 'status', 'wf-1'],
      ],
      [
        'workflows.models("wf-1")',
        queryKeys.workflows.models('wf-1'),
        ['workflows', 'models', 'wf-1'],
      ],
      [
        'workflows.finalizeCleanup("wf-1")',
        queryKeys.workflows.finalizeCleanup('wf-1'),
        ['workflows', 'finalize-cleanup', 'wf-1'],
      ],
      [
        'workflows.templates.list() 기본값',
        queryKeys.workflows.templates.list(),
        ['workflows', 'templates', {}],
      ],
      [
        'workflows.templates.detail("tpl-1")',
        queryKeys.workflows.templates.detail('tpl-1'),
        ['workflows', 'templates', 'detail', 'tpl-1'],
      ],
    ])('%s', (_name, actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  // ============================================
  // knowledgeBases 계층 — detail 무효화가 files/searchRecords까지 전파
  // ============================================
  describe('knowledgeBases 캐시 계층', () => {
    it('detail(id) 무효화 시 해당 KB의 files/searchRecords만 무효화되고 다른 KB는 유지된다', async () => {
      const client = new QueryClient();
      seed(client, queryKeys.knowledgeBases.files(2));
      seed(client, queryKeys.knowledgeBases.searchRecords(2));
      seed(client, queryKeys.knowledgeBases.files(3));

      await client.invalidateQueries({ queryKey: queryKeys.knowledgeBases.detail(2) });

      expect(isInvalidated(client, queryKeys.knowledgeBases.files(2))).toBe(true);
      expect(isInvalidated(client, queryKeys.knowledgeBases.searchRecords(2))).toBe(true);
      expect(isInvalidated(client, queryKeys.knowledgeBases.files(3))).toBe(false);
    });
  });

  // ============================================
  // list(params) 구조적 동일성 — 재호출/프로퍼티 순서 무관 캐시 히트 보장
  // ============================================
  describe('list(params) 구조적 동일성', () => {
    it.each<[string, () => readonly unknown[]]>([
      ['models.list', () => queryKeys.models.list({ page: 2, size: 20, search: 'q' })],
      ['services.list', () => queryKeys.services.list({ page: 2, size: 20, search: 'q' })],
      ['prompts.list', () => queryKeys.prompts.list({ page: 2, size: 20, search: 'q' })],
      ['datasets.list', () => queryKeys.datasets.list({ page: 2, size: 20, search: 'q' })],
      ['workflows.list', () => queryKeys.workflows.list({ page: 2, size: 20, search: 'q' })],
      [
        'workflows.templates.list',
        () => queryKeys.workflows.templates.list({ page: 2, size: 20 }),
      ],
    ])('%s 는 동일 params에 대해 구조적으로 동일한 키를 생성한다', (_name, makeKey) => {
      expect(makeKey()).toStrictEqual(makeKey());
      expect(hashKey(makeKey())).toBe(hashKey(makeKey()));
    });

    it('params 프로퍼티 순서가 달라도 React Query 해시는 동일하다 (캐시 히트)', () => {
      expect(hashKey(queryKeys.models.list({ page: 1, size: 10 }))).toBe(
        hashKey(queryKeys.models.list({ size: 10, page: 1 }))
      );
    });

    it('기본값 호출 list()와 명시적 빈 객체 list({})는 동일한 키를 생성한다', () => {
      expect(queryKeys.models.list()).toStrictEqual(queryKeys.models.list({}));
      expect(hashKey(queryKeys.models.list())).toBe(hashKey(queryKeys.models.list({})));
    });
  });
});
