import { useWorkflowStore } from '@/store/useWorkflowStore';

// 모듈 로드 시점의 초기 상태를 캡처해 통째로 복원한다 (필드 열거 불필요 — 스토어 변경에 자동 추종).
const initialState = useWorkflowStore.getInitialState();

/**
 * useWorkflowStore는 모듈 스코프 전역 싱글턴이라 테스트 간 상태(nodes/edges/history)가
 * 누출된다. 스토어를 쓰는 테스트 파일은 반드시 beforeEach에서 호출할 것:
 *
 *   beforeEach(() => resetWorkflowStore());
 *
 * test-utils.tsx가 아닌 별도 파일인 이유: 스토어가 @xyflow/react를 끌고 오므로
 * 모든 컴포넌트 테스트에 그 로딩 비용을 지우지 않기 위해서다.
 */
export const resetWorkflowStore = () => {
  useWorkflowStore.setState(initialState, true);
};
