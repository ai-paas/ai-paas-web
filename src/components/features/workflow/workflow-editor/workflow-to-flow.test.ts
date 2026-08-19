import type { Edge } from '@xyflow/react';
import { describe, it, expect } from 'vitest';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import type {
  WorkflowComponent,
  WorkflowComponentConnection,
  WorkflowDefinition,
} from '@/types/workflow';
import { buildWorkflowDefinition } from './build-workflow-definition';
import { workflowToFlow } from './workflow-to-flow';

// API 응답(WorkflowRead.components 등)을 흉내 내는 최소 컴포넌트 팩토리.
// name 기본값은 `${type} 노드`이며 라벨 폴백 테스트에서는 name: ''로 덮어쓴다.
const createComponent = (
  overrides: Partial<WorkflowComponent> & Pick<WorkflowComponent, 'id' | 'type'>
): WorkflowComponent => ({
  workflow_id: 'wf-1',
  component_id: overrides.type,
  name: `${overrides.type} 노드`,
  ...overrides,
});

const findNode = (nodes: WorkflowNode[], id: string): WorkflowNode => {
  const node = nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`노드를 찾을 수 없습니다: ${id}`);
  return node;
};

describe('workflowToFlow', () => {
  // ============================================
  // 빈 입력 처리
  // ============================================
  describe('빈 입력 처리', () => {
    it('workflow가 undefined면 빈 nodes/edges를 반환한다', () => {
      expect(workflowToFlow()).toEqual({ nodes: [], edges: [] });
      expect(workflowToFlow(undefined)).toEqual({ nodes: [], edges: [] });
    });

    it('components와 component_connections가 없으면 빈 nodes/edges를 반환한다', () => {
      expect(workflowToFlow({})).toEqual({ nodes: [], edges: [] });
    });

    it('components 없이 connections만 있으면 모든 엣지가 걸러진다', () => {
      const { nodes, edges } = workflowToFlow({
        component_connections: [{ source_component_id: 'a', target_component_id: 'b' }],
      });

      expect(nodes).toEqual([]);
      expect(edges).toEqual([]);
    });
  });

  // ============================================
  // 기본 매핑
  // ============================================
  describe('기본 매핑', () => {
    it('컴포넌트 id와 type이 노드 id/type으로 그대로 매핑된다', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'comp-1', type: 'START' }),
          createComponent({ id: 'comp-2', type: 'MODEL' }),
        ],
      });

      expect(nodes.map((node) => [node.id, node.type])).toEqual([
        ['comp-1', 'START'],
        ['comp-2', 'MODEL'],
      ]);
    });
  });

  // ============================================
  // 노드 배치 (x/y 폴백 규칙)
  // ============================================
  describe('노드 배치', () => {
    it('x/y가 모두 숫자면 저장된 좌표를 그대로 사용한다 (0도 유효 좌표)', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'a', type: 'MODEL', x: 123, y: 456 }),
          createComponent({ id: 'b', type: 'END', x: 0, y: 0 }),
        ],
      });

      expect(nodes[0].position).toEqual({ x: 123, y: 456 });
      expect(nodes[1].position).toEqual({ x: 0, y: 0 });
    });

    it('좌표가 없으면 x는 index * 300, y는 START/END 120·그 외 220으로 배치한다', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'a', type: 'START' }),
          createComponent({ id: 'b', type: 'MODEL' }),
          createComponent({ id: 'c', type: 'KNOWLEDGE_BASE' }),
          createComponent({ id: 'd', type: 'END' }),
        ],
      });

      expect(nodes.map((node) => node.position)).toEqual([
        { x: 0, y: 120 },
        { x: 300, y: 220 },
        { x: 600, y: 220 },
        { x: 900, y: 120 },
      ]);
    });

    it.each<[string, number | null, number | null]>([
      ['x만 숫자면', 500, null],
      ['y만 숫자면', null, 50],
    ])('%s 저장 좌표를 버리고 좌표 전체를 폴백으로 계산한다', (_label, x, y) => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'a', type: 'START', x: 0, y: 0 }),
          createComponent({ id: 'b', type: 'MODEL', x, y }),
        ],
      });

      expect(nodes[1].position).toEqual({ x: 300, y: 220 });
    });
  });

  // ============================================
  // 엣지 변환 (dangling 필터·id 생성)
  // ============================================
  describe('엣지 변환', () => {
    const components = [
      createComponent({ id: 'a', type: 'START' }),
      createComponent({ id: 'b', type: 'END' }),
    ];

    it('connection의 source/target 컴포넌트 id가 엣지에 그대로 매핑된다', () => {
      const { edges } = workflowToFlow({
        components,
        component_connections: [{ source_component_id: 'a', target_component_id: 'b' }],
      });

      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe('a');
      expect(edges[0].target).toBe('b');
    });

    it('connection.id가 있으면 그대로 엣지 id로 사용한다', () => {
      const { edges } = workflowToFlow({
        components,
        component_connections: [
          { id: 'conn-1', source_component_id: 'a', target_component_id: 'b' },
        ],
      });

      expect(edges[0].id).toBe('conn-1');
    });

    it('connection.id가 없으면 e-{source}-{target}-{index} 형식으로 생성한다', () => {
      const { edges } = workflowToFlow({
        components,
        component_connections: [
          { source_component_id: 'a', target_component_id: 'b' },
          { source_component_id: 'b', target_component_id: 'a' },
        ],
      });

      expect(edges.map((edge) => edge.id)).toEqual(['e-a-b-0', 'e-b-a-1']);
    });

    it.each<[string, WorkflowComponentConnection]>([
      ['source가 존재하지 않으면', { source_component_id: 'ghost', target_component_id: 'b' }],
      ['target이 존재하지 않으면', { source_component_id: 'a', target_component_id: 'ghost' }],
      [
        '양쪽 모두 존재하지 않으면',
        { source_component_id: 'ghost-1', target_component_id: 'ghost-2' },
      ],
    ])('%s 해당 connection(dangling edge)은 걸러진다', (_label, connection) => {
      const { edges } = workflowToFlow({ components, component_connections: [connection] });

      expect(edges).toEqual([]);
    });

    it('생성 엣지 id의 순번은 dangling 필터 이후의 index를 따른다', () => {
      const { edges } = workflowToFlow({
        components,
        component_connections: [
          // 원본 index 0은 걸러지고, 살아남은 connection이 index 0으로 다시 매겨진다.
          { source_component_id: 'ghost', target_component_id: 'b' },
          { source_component_id: 'a', target_component_id: 'b' },
        ],
      });

      expect(edges).toHaveLength(1);
      expect(edges[0].id).toBe('e-a-b-0');
    });
  });

  // ============================================
  // MODEL 노드 역직렬화
  // ============================================
  describe('MODEL 노드 역직렬화', () => {
    it.each<[string, Record<string, unknown> | null | undefined]>([
      ['config가 undefined면', undefined],
      ['config가 null이면', null],
      ['config가 빈 객체면', {}],
      ['config 값이 숫자가 아니면', { temperature: '0.5', top_p: null, max_tokens: '많이' }],
    ])('%s 기본값 temperature 0.7 / top_p 0.9 / max_tokens 2048을 적용한다', (_label, config) => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'm1', type: 'MODEL', config })],
      });

      expect(nodes[0].data.temperature).toBe(0.7);
      expect(nodes[0].data.top_p).toBe(0.9);
      expect(nodes[0].data.max_tokens).toBe(2048);
    });

    it('config의 숫자 값은 0을 포함해 그대로 사용한다', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({
            id: 'm1',
            type: 'MODEL',
            config: { temperature: 0, top_p: 0.1, max_tokens: 1 },
          }),
        ],
      });

      expect(nodes[0].data.temperature).toBe(0);
      expect(nodes[0].data.top_p).toBe(0.1);
      expect(nodes[0].data.max_tokens).toBe(1);
    });

    it('model_id와 prompt_id 숫자를 문자열로 변환한다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'm1', type: 'MODEL', model_id: 12, prompt_id: 34 })],
      });

      expect(nodes[0].data.model_id).toBe('12');
      expect(nodes[0].data.prompt_id).toBe('34');
    });

    it.each<[string, null | undefined]>([
      ['null이면', null],
      ['undefined면', undefined],
    ])('model_id·prompt_id가 %s 빈 문자열로 변환한다', (_label, value) => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'm1', type: 'MODEL', model_id: value, prompt_id: value }),
        ],
      });

      expect(nodes[0].data.model_id).toBe('');
      expect(nodes[0].data.prompt_id).toBe('');
    });

    it("특성화: model_id·prompt_id가 0이면 falsy 처리되어 '0'이 아닌 빈 문자열이 된다", () => {
      // 버그 의심 — 팀 확인 필요: truthiness 검사(component.model_id ? ...)라 id 0이 유실된다.
      // 실서비스 id는 1 이상이라 영향은 낮지만 String() 변환 전 명시적 null 체크가 안전하다.
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'm1', type: 'MODEL', model_id: 0, prompt_id: 0 })],
      });

      expect(nodes[0].data.model_id).toBe('');
      expect(nodes[0].data.prompt_id).toBe('');
    });

    it('context는 빈 문자열로 초기화되고 type(모델 유형)은 미지정으로 둔다', () => {
      // type을 'custom'으로 채우면 카탈로그 모델을 쓴 노드가 수정 화면에서
      // 커스텀 목록만 뒤져 선택값이 사라진다 — 미지정으로 두고 편집 화면에서 역추론한다.
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'm1', type: 'MODEL' })],
      });

      expect(nodes[0].data.context).toBe('');
      expect(nodes[0].data.type).toBeUndefined();
    });
  });

  // ============================================
  // KNOWLEDGE_BASE 노드 역직렬화
  // ============================================
  describe('KNOWLEDGE_BASE 노드 역직렬화', () => {
    it('knowledge_base_id를 knowledgebase_id 문자열로 변환하고 data 형태를 갖춘다', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({
            id: 'k1',
            type: 'KNOWLEDGE_BASE',
            knowledge_base_id: 7,
            config: { top_k: 10 },
          }),
        ],
      });

      expect(nodes[0].data).toEqual({
        label: 'KNOWLEDGE_BASE 노드',
        name: 'KNOWLEDGE_BASE 노드',
        description: '',
        query_variable: '',
        knowledgebase_id: '7',
        top_k: 10,
      });
    });

    it('knowledge_base_id가 없으면 빈 문자열이다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'k1', type: 'KNOWLEDGE_BASE', knowledge_base_id: null })],
      });

      expect(nodes[0].data.knowledgebase_id).toBe('');
    });

    it.each<[string, Record<string, unknown> | null | undefined]>([
      ['config가 undefined면', undefined],
      ['config가 null이면', null],
      ['config가 빈 객체면', {}],
      ['top_k가 숫자가 아니면', { top_k: '5' }],
    ])('%s top_k 기본값 3을 적용한다', (_label, config) => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'k1', type: 'KNOWLEDGE_BASE', config })],
      });

      expect(nodes[0].data.top_k).toBe(3);
    });

    it('top_k가 0이면 기본값이 아닌 0을 그대로 사용한다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'k1', type: 'KNOWLEDGE_BASE', config: { top_k: 0 } })],
      });

      expect(nodes[0].data.top_k).toBe(0);
    });
  });

  // ============================================
  // START / END 노드 역직렬화
  // ============================================
  describe('START/END 노드 역직렬화', () => {
    it('START 노드는 빈 inputFields로 초기화된다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 's1', type: 'START', description: '진입점' })],
      });

      expect(nodes[0].data).toEqual({
        label: 'START 노드',
        name: 'START 노드',
        description: '진입점',
        inputFields: [],
      });
    });

    it('END 노드는 빈 output_variable로 초기화된다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'e1', type: 'END' })],
      });

      expect(nodes[0].data).toEqual({
        label: 'END 노드',
        name: 'END 노드',
        description: '',
        output_variable: [],
      });
    });
  });

  // ============================================
  // 이름·라벨·설명 폴백
  // ============================================
  describe('이름·라벨·설명 폴백', () => {
    it('name이 있으면 label과 name에 그대로 사용한다', () => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'm1', type: 'MODEL', name: '요약 모델' })],
      });

      expect(nodes[0].data.label).toBe('요약 모델');
      expect(nodes[0].data.name).toBe('요약 모델');
    });

    // 특성화: 역직렬화 폴백 라벨은 영문 타입명이다. 같은 디렉토리
    // workflow-node-defaults.ts의 신규 노드 라벨('시작'·'모델' 등 한국어)과 불일치한다
    // — 버그 의심(라벨 소스 이원화), 팀 확인 필요.
    it.each([
      ['START', 'START'],
      ['MODEL', 'MODEL'],
      ['KNOWLEDGE_BASE', 'KNOWLEDGE_BASE'],
      ['END', 'END'],
    ] as const)('name이 빈 문자열인 %s 컴포넌트는 영문 타입명을 라벨로 사용한다', (type, expected) => {
      const { nodes } = workflowToFlow({
        components: [createComponent({ id: 'n1', type, name: '' })],
      });

      expect(nodes[0].data.label).toBe(expected);
      expect(nodes[0].data.name).toBe(expected);
    });

    it('description이 null이거나 없으면 빈 문자열로 변환한다', () => {
      const { nodes } = workflowToFlow({
        components: [
          createComponent({ id: 'a', type: 'MODEL', description: null }),
          createComponent({ id: 'b', type: 'END' }),
        ],
      });

      expect(nodes[0].data.description).toBe('');
      expect(nodes[1].data.description).toBe('');
    });
  });

  // ============================================
  // buildWorkflowDefinition 왕복(round-trip)
  // 캔버스 → 저장 페이로드 → (백엔드 echo) → 캔버스 재구성 시 의미 보존 여부
  // ============================================
  describe('buildWorkflowDefinition 왕복(round-trip)', () => {
    // 백엔드가 definition을 저장한 뒤 상세 조회로 돌려주는 응답을 흉내 낸다.
    // ref_id → id, source_ref_id/target_ref_id → source/target_component_id 로 되돌아온다.
    const toApiEcho = (
      definition: WorkflowDefinition
    ): { components: WorkflowComponent[]; component_connections: WorkflowComponentConnection[] } => ({
      components: definition.components.map((component) => ({
        id: component.ref_id,
        workflow_id: 'wf-1',
        component_id: component.type,
        name: component.name,
        type: component.type,
        description: component.description ?? null,
        model_id: component.model_id ?? null,
        knowledge_base_id: component.knowledge_base_id ?? null,
        prompt_id: component.prompt_id ?? null,
        config: component.config ?? null,
        x: component.x ?? null,
        y: component.y ?? null,
      })),
      component_connections: definition.connections.map((connection) => ({
        source_component_id: connection.source_ref_id,
        target_component_id: connection.target_ref_id,
      })),
    });

    const canvasNodes: WorkflowNode[] = [
      {
        id: 'start-1',
        type: 'START',
        position: { x: 10.4, y: 120 },
        data: {
          label: '시작',
          name: '시작',
          description: '시작 노드',
          inputFields: [
            {
              type: 'text',
              variable: 'question',
              label: '질문',
              max_length: 100,
              file_type: '',
              file_upload: '',
              file_max_number: 0,
            },
          ],
        },
      },
      {
        id: 'model-1',
        type: 'MODEL',
        position: { x: 300.6, y: 220.5 },
        data: {
          label: 'LLM 노드',
          name: 'LLM 노드',
          description: '모델 설명',
          type: 'catalog',
          model_id: '12',
          context: 'question',
          prompt_id: '34',
          temperature: 0.3,
          top_p: 0.8,
          max_tokens: 1024,
        },
      },
      {
        id: 'kb-1',
        type: 'KNOWLEDGE_BASE',
        position: { x: 600, y: 220 },
        data: {
          label: '지식베이스',
          name: '지식베이스',
          description: '',
          query_variable: 'question',
          knowledgebase_id: '7',
          top_k: 5,
        },
      },
      {
        id: 'end-1',
        type: 'END',
        position: { x: 900, y: 120 },
        data: {
          label: '끝',
          name: '끝',
          description: '',
          output_variable: [{ name: 'answer', value: 'model-1.output' }],
        },
      },
    ];

    const canvasEdges: Edge[] = [
      { id: 'edge-1', source: 'start-1', target: 'kb-1' },
      { id: 'edge-2', source: 'kb-1', target: 'model-1' },
      { id: 'edge-3', source: 'model-1', target: 'end-1' },
    ];

    const definition = buildWorkflowDefinition(canvasNodes, canvasEdges);
    const { nodes, edges } = workflowToFlow(toApiEcho(definition));

    it('노드 id·타입·이름·설명이 보존된다', () => {
      expect(
        nodes.map((node) => [node.id, node.type, node.data.name, node.data.description])
      ).toEqual([
        ['start-1', 'START', '시작', '시작 노드'],
        ['model-1', 'MODEL', 'LLM 노드', '모델 설명'],
        ['kb-1', 'KNOWLEDGE_BASE', '지식베이스', ''],
        ['end-1', 'END', '끝', ''],
      ]);
    });

    it('노드 좌표는 정수로 반올림되어 보존된다', () => {
      expect(nodes.map((node) => node.position)).toEqual([
        { x: 10, y: 120 }, // 10.4 → 10
        { x: 301, y: 221 }, // 300.6 → 301, 220.5 → 221
        { x: 600, y: 220 },
        { x: 900, y: 120 },
      ]);
    });

    it('MODEL의 model_id·prompt_id·샘플링 파라미터가 보존된다', () => {
      expect(findNode(nodes, 'model-1').data).toMatchObject({
        model_id: '12',
        prompt_id: '34',
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 1024,
      });
    });

    it('KNOWLEDGE_BASE의 knowledgebase_id·top_k가 보존된다', () => {
      expect(findNode(nodes, 'kb-1').data).toMatchObject({
        knowledgebase_id: '7',
        top_k: 5,
      });
    });

    it('연결(source→target)은 보존되고 엣지 id는 새로 생성된다', () => {
      expect(edges.map((edge) => [edge.source, edge.target])).toEqual([
        ['start-1', 'kb-1'],
        ['kb-1', 'model-1'],
        ['model-1', 'end-1'],
      ]);

      // connection 정의에는 id가 없으므로 원본 엣지 id(edge-1 등)는 보존 대상이 아니다.
      expect(edges.map((edge) => edge.id)).toEqual([
        'e-start-1-kb-1-0',
        'e-kb-1-model-1-1',
        'e-model-1-end-1-2',
      ]);
    });

    it('설정하지 않은 MODEL 파라미터는 왕복 후 기본값으로 채워진다', () => {
      const sparseModel: WorkflowNode = {
        id: 'm-sparse',
        type: 'MODEL',
        position: { x: 0, y: 0 },
        data: { label: '모델', name: '모델', type: 'custom', model_id: '', context: '', prompt_id: '' },
      };

      const result = workflowToFlow(toApiEcho(buildWorkflowDefinition([sparseModel], [])));

      expect(result.nodes[0].data).toEqual({
        label: '모델',
        name: '모델',
        description: '',
        model_id: '',
        context: '',
        prompt_id: '',
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
      });
    });

    it('특성화: 사용자 편집 필드는 왕복 후 초기화된다 (저장 시 유실)', () => {
      // 버그 의심 — 팀 확인 필요:
      // start-setting/model-setting/knowledge-setting/end-setting 패널에서 편집 가능한
      // inputFields·context·query_variable·output_variable이
      // buildWorkflowDefinition에서 직렬화되지 않아 저장 후 재로딩하면 사라진다.
      // MODEL의 type도 직렬화되지 않지만, 미지정으로 남겨 편집 화면에서 역추론으로 복원한다.
      const modelData = findNode(nodes, 'model-1').data;

      expect(modelData.context).toBe(''); // 입력값 'question' 유실
      expect(modelData.type).toBeUndefined(); // 'catalog' 자체는 저장 안 됨 — 편집 화면에서 역추론
      expect(findNode(nodes, 'kb-1').data.query_variable).toBe(''); // 'question' 유실
      expect(findNode(nodes, 'start-1').data.inputFields).toEqual([]); // 1건 유실
      expect(findNode(nodes, 'end-1').data.output_variable).toEqual([]); // 1건 유실
    });

    it('NOTE 노드는 직렬화 대상이 아니어서 왕복 후 사라진다 (프론트 전용 노드)', () => {
      const noteNode: WorkflowNode = {
        id: 'note-1',
        type: 'NOTE',
        position: { x: 50, y: 50 },
        data: { label: '메모', text: '배포 전 확인' },
      };

      const roundTripDefinition = buildWorkflowDefinition([...canvasNodes, noteNode], canvasEdges);
      expect(roundTripDefinition.components.map((component) => component.ref_id)).not.toContain(
        'note-1'
      );

      const result = workflowToFlow(toApiEcho(roundTripDefinition));
      expect(result.nodes.map((node) => node.id)).not.toContain('note-1');
    });
  });
});
