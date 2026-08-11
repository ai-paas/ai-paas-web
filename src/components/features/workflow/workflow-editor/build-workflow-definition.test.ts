import { describe, it, expect } from 'vitest';
import type { Edge } from '@xyflow/react';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import { buildWorkflowDefinition } from './build-workflow-definition';

interface MakeNodeOptions {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
  position?: { x: number; y: number };
}

// NodeData 유니온의 필수 필드(label 등)는 직렬화 로직이 참조하지 않으므로
// 테스트 편의상 필요한 키만 담아 캐스팅한다.
const makeNode = ({
  id = 'node-1',
  type = 'MODEL',
  data = {},
  position = { x: 0, y: 0 },
}: MakeNodeOptions = {}): WorkflowNode => ({ id, type, data, position }) as unknown as WorkflowNode;

const makeEdge = (source: string, target: string): Edge => ({
  id: `${source}->${target}`,
  source,
  target,
});

describe('buildWorkflowDefinition', () => {
  // ============================================
  // 기본 구조 직렬화
  // ============================================
  describe('기본 구조', () => {
    it('노드/엣지가 비어 있으면 빈 components/connections를 반환한다', () => {
      expect(buildWorkflowDefinition([], [])).toEqual({ components: [], connections: [] });
    });

    it('NOTE 타입 노드는 components에서 제외된다', () => {
      const nodes = [
        makeNode({ id: 'start-1', type: 'START' }),
        makeNode({ id: 'note-1', type: 'NOTE', data: { text: '메모' } }),
        makeNode({ id: 'end-1', type: 'END' }),
      ];

      const { components } = buildWorkflowDefinition(nodes, []);

      expect(components).toHaveLength(2);
      expect(components.map((c) => c.ref_id)).toEqual(['start-1', 'end-1']);
    });

    it('ref_id는 node.id, type은 node.type을 그대로 사용한다', () => {
      const { components } = buildWorkflowDefinition(
        [makeNode({ id: 'model-42', type: 'MODEL' })],
        []
      );

      expect(components[0].ref_id).toBe('model-42');
      expect(components[0].type).toBe('MODEL');
    });

    it('edges의 source/target이 connections의 source_ref_id/target_ref_id로 매핑된다', () => {
      const edges = [makeEdge('start-1', 'model-1'), makeEdge('model-1', 'end-1')];

      const { connections } = buildWorkflowDefinition([], edges);

      expect(connections).toEqual([
        { source_ref_id: 'start-1', target_ref_id: 'model-1' },
        { source_ref_id: 'model-1', target_ref_id: 'end-1' },
      ]);
    });
  });

  // ============================================
  // name 결정 규칙
  // ============================================
  describe('name 결정', () => {
    it.each([
      { label: 'name이 없으면 node.id를 사용한다', data: {}, expected: 'node-1' },
      { label: "name이 빈 문자열('')이면 node.id를 사용한다", data: { name: '' }, expected: 'node-1' },
      { label: 'name이 비문자열(숫자)이면 node.id를 사용한다', data: { name: 123 }, expected: 'node-1' },
      { label: 'name이 유효한 문자열이면 그대로 사용한다', data: { name: '내 모델' }, expected: '내 모델' },
    ])('$label', ({ data, expected }) => {
      const [component] = buildWorkflowDefinition([makeNode({ data })], []).components;

      expect(component.name).toBe(expected);
    });
  });

  // ============================================
  // MODEL 노드 config 변환
  // ============================================
  describe('MODEL config 변환', () => {
    it('temperature/top_p/max_tokens 숫자 문자열을 number로 변환한다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { temperature: '0.7', top_p: '0.9', max_tokens: '2048' } })],
        []
      ).components;

      expect(component.config).toEqual({ temperature: 0.7, top_p: 0.9, max_tokens: 2048 });
    });

    it('숫자 0은 falsy지만 유효한 값으로 유지된다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { temperature: 0 } })],
        []
      ).components;

      expect(component.config).toEqual({ temperature: 0 });
    });

    it.each([
      { label: "빈 문자열('')", value: '' },
      { label: 'undefined', value: undefined },
      { label: 'null', value: null },
    ])('temperature가 $label 이면 config에서 해당 키가 제거된다', ({ value }) => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { temperature: value, top_p: '0.9' } })],
        []
      ).components;

      expect(component.config).toEqual({ top_p: 0.9 });
      expect(component.config).not.toHaveProperty('temperature');
    });

    it.each([
      { label: "'abc' (숫자 변환 불가 문자열)", value: 'abc' },
      { label: 'NaN', value: NaN },
      { label: 'Infinity', value: Infinity },
    ])('max_tokens가 $label 이면 config에서 해당 키가 제거된다', ({ value }) => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { max_tokens: value, temperature: '0.5' } })],
        []
      ).components;

      expect(component.config).toEqual({ temperature: 0.5 });
      expect(component.config).not.toHaveProperty('max_tokens');
    });

    it('세 값이 모두 비어 있으면 config 자체가 undefined다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { temperature: '', top_p: undefined } })],
        []
      ).components;

      expect(component.config).toBeUndefined();
    });

    // 특성화 테스트: Number(' ') === 0 이라 공백 문자열이 temperature 0으로 직렬화된다.
    // 버그 의심 — 팀 확인 필요 (공백만 입력해도 빈값 제거가 아니라 0으로 저장됨)
    it("공백 문자열(' ')은 키 제거가 아니라 0으로 변환된다 (현재 동작 고정)", () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { temperature: ' ' } })],
        []
      ).components;

      expect(component.config).toEqual({ temperature: 0 });
    });
  });

  // ============================================
  // KNOWLEDGE_BASE 노드 config 변환
  // ============================================
  describe('KNOWLEDGE_BASE config 변환', () => {
    it('top_k 숫자 문자열을 number로 변환하고 MODEL 전용 키는 포함하지 않는다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ type: 'KNOWLEDGE_BASE', data: { top_k: '3', temperature: '0.5' } })],
        []
      ).components;

      expect(component.config).toEqual({ top_k: 3 });
    });

    it('top_k가 없으면 config는 undefined다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ type: 'KNOWLEDGE_BASE', data: { top_k: '' } })],
        []
      ).components;

      expect(component.config).toBeUndefined();
    });

    it('data.knowledgebase_id가 knowledge_base_id 키로 매핑되고 number로 변환된다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ type: 'KNOWLEDGE_BASE', data: { knowledgebase_id: '7' } })],
        []
      ).components;

      expect(component.knowledge_base_id).toBe(7);
    });

    it('data에 snake_case knowledge_base_id 키만 있으면 읽지 않는다 (스토어 키는 knowledgebase_id)', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ type: 'KNOWLEDGE_BASE', data: { knowledge_base_id: '7' } })],
        []
      ).components;

      expect(component.knowledge_base_id).toBeUndefined();
    });
  });

  // ============================================
  // START / END 노드
  // ============================================
  describe('START/END config', () => {
    it.each([{ type: 'START' }, { type: 'END' }])(
      '$type 노드는 data에 수치 키가 있어도 config가 undefined다',
      ({ type }) => {
        const [component] = buildWorkflowDefinition(
          [makeNode({ type, data: { temperature: '0.7', top_k: '3' } })],
          []
        ).components;

        expect(component.config).toBeUndefined();
      }
    );
  });

  // ============================================
  // model_id / prompt_id 변환
  // ============================================
  describe('model_id / prompt_id 변환', () => {
    it.each([
      { label: "숫자 문자열 '10'", value: '10', expected: 10 },
      { label: '숫자 10', value: 10, expected: 10 },
      { label: "'abc' (변환 불가 문자열)", value: 'abc', expected: undefined },
      { label: 'NaN', value: NaN, expected: undefined },
      { label: 'Infinity', value: Infinity, expected: undefined },
      { label: "빈 문자열('')", value: '', expected: undefined },
      { label: 'null', value: null, expected: undefined },
      { label: 'undefined', value: undefined, expected: undefined },
    ])('model_id가 $label 이면 $expected 로 직렬화된다', ({ value, expected }) => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { model_id: value } })],
        []
      ).components;

      expect(component.model_id).toBe(expected);
    });

    it.each([
      { label: "숫자 문자열 '5'는 5", value: '5', expected: 5 },
      { label: "'abc'는 undefined", value: 'abc', expected: undefined },
    ])('prompt_id가 $label 로 직렬화된다', ({ value, expected }) => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { prompt_id: value } })],
        []
      ).components;

      expect(component.prompt_id).toBe(expected);
    });
  });

  // ============================================
  // position(x, y) 변환
  // ============================================
  describe('position 변환', () => {
    it.each([
      { label: '소수점은 반올림된다 (내림)', x: 10.4, y: 20.6, ex: 10, ey: 21 },
      { label: '.5는 올림된다', x: 10.5, y: 0.5, ex: 11, ey: 1 },
      { label: '음수 -10.5는 -10으로 반올림된다 (Math.round 특성)', x: -10.5, y: -10.6, ex: -10, ey: -11 },
    ])('$label', ({ x, y, ex, ey }) => {
      const [component] = buildWorkflowDefinition([makeNode({ position: { x, y } })], []).components;

      expect(component.x).toBe(ex);
      expect(component.y).toBe(ey);
    });

    it('position이 없으면 x/y는 undefined다', () => {
      // @xyflow Node 타입상 position은 필수지만 런타임 방어(?.) 동작을 검증한다.
      const node = { id: 'no-pos', type: 'START', data: {} } as unknown as WorkflowNode;

      const [component] = buildWorkflowDefinition([node], []).components;

      expect(component.x).toBeUndefined();
      expect(component.y).toBeUndefined();
    });
  });

  // ============================================
  // description 변환
  // ============================================
  describe('description 변환', () => {
    it('문자열이면 그대로 직렬화한다', () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { description: '설명 텍스트' } })],
        []
      ).components;

      expect(component.description).toBe('설명 텍스트');
    });

    it.each([
      { label: '숫자', value: 123 },
      { label: 'null', value: null },
      { label: 'boolean', value: true },
    ])('비문자열($label)이면 undefined로 직렬화한다', ({ value }) => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { description: value } })],
        []
      ).components;

      expect(component.description).toBeUndefined();
    });

    // 특성화 테스트: 빈 문자열 description은 undefined로 걸러지지 않고 ''로 전송된다.
    it("빈 문자열('')은 undefined로 바뀌지 않고 그대로 유지된다 (현재 동작 고정)", () => {
      const [component] = buildWorkflowDefinition(
        [makeNode({ data: { description: '' } })],
        []
      ).components;

      expect(component.description).toBe('');
    });
  });
});
