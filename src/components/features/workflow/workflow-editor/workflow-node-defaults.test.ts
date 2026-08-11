import { randomUUID } from 'node:crypto';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { DEFAULT_LABEL, createNodeId, createWorkflowNodeData } from './workflow-node-defaults';

describe('workflow-node-defaults', () => {
  // ============================================
  // DEFAULT_LABEL
  // ============================================
  describe('DEFAULT_LABEL', () => {
    it('워크플로우 컴포넌트 타입별 한국어 기본 라벨을 정의한다', () => {
      expect(DEFAULT_LABEL).toEqual({
        START: '시작',
        MODEL: '모델',
        KNOWLEDGE_BASE: '지식베이스',
        END: '끝',
      });
    });
  });

  // ============================================
  // createWorkflowNodeData
  // ============================================
  describe('createWorkflowNodeData', () => {
    it.each([
      {
        type: 'START' as const,
        expected: { label: '시작', name: '시작', inputFields: [] },
      },
      {
        type: 'KNOWLEDGE_BASE' as const,
        expected: {
          label: '지식베이스',
          name: '지식베이스',
          query_variable: '',
          knowledgebase_id: '',
          top_k: 3,
        },
      },
      {
        type: 'MODEL' as const,
        expected: {
          label: '모델',
          name: '모델',
          type: 'custom',
          model_id: '',
          context: '',
          prompt_id: '',
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
        },
      },
      {
        type: 'END' as const,
        expected: { label: '끝', name: '끝', output_variable: [] },
      },
    ])('$type 타입의 기본 노드 데이터를 생성한다', ({ type, expected }) => {
      expect(createWorkflowNodeData(type)).toEqual(expected);
    });

    it('호출할 때마다 새로운 객체/배열 참조를 반환한다 (상태 공유 없음)', () => {
      const first = createWorkflowNodeData('START');
      const second = createWorkflowNodeData('START');

      expect(first).not.toBe(second);
      expect(first.inputFields).not.toBe(second.inputFields);

      const firstEnd = createWorkflowNodeData('END');
      const secondEnd = createWorkflowNodeData('END');

      expect(firstEnd.output_variable).not.toBe(secondEnd.output_variable);
    });
  });

  // ============================================
  // createNodeId
  // ============================================
  describe('createNodeId', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('crypto.randomUUID가 있으면 그 반환값을 그대로 사용한다', () => {
      vi.stubGlobal('crypto', { randomUUID: () => 'fixed-uuid' });

      expect(createNodeId()).toBe('fixed-uuid');
    });

    it('UUID 형식의 id를 생성한다', () => {
      vi.stubGlobal('crypto', { randomUUID });

      expect(createNodeId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('연속 호출해도 중복된 id가 없다', () => {
      vi.stubGlobal('crypto', { randomUUID });

      const ids = new Set(Array.from({ length: 200 }, () => createNodeId()));

      expect(ids.size).toBe(200);
    });

    it('crypto가 없으면 타임스탬프 기반 폴백 형식(n{ms}-{rand})을 사용한다', () => {
      vi.stubGlobal('crypto', undefined);

      expect(createNodeId()).toMatch(/^n\d+-\d+$/);
    });

    it('crypto.randomUUID가 함수가 아니어도 폴백 경로를 사용한다', () => {
      vi.stubGlobal('crypto', {});

      expect(createNodeId()).toMatch(/^n\d+-\d+$/);
    });

    it('폴백 id는 Date.now와 Math.random 값으로 결정된다', () => {
      vi.stubGlobal('crypto', undefined);
      vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      expect(createNodeId()).toBe('n1700000000000-50000');
    });
  });
});
