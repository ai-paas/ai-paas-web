import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { fireEvent, renderWithUser, screen, waitFor } from '@/test/utils/test-utils';
import { PromptEditor } from './prompt-editor';

// PromptEditor는 제어 컴포넌트라 상태를 가진 하네스로 감싸서 테스트한다
const Harness = ({
  allowedVariables,
  initialValue = '',
}: {
  allowedVariables?: string[];
  initialValue?: string;
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <PromptEditor
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="프롬프트를 입력해주세요."
      allowedVariables={allowedVariables}
    />
  );
};

const ALLOWED = ['context', 'query', 'memory'];

const getTextarea = () =>
  screen.getByPlaceholderText('프롬프트를 입력해주세요.') as HTMLTextAreaElement;

// userEvent.type에서 '{'는 특수문자라 '{{'로 이스케이프해야 리터럴 '{' 하나가 입력된다
const typeInEditor = async (user: ReturnType<typeof renderWithUser>['user'], text: string) => {
  await user.type(getTextarea(), text);
};

describe('PromptEditor', () => {
  describe('하이라이트 레이어', () => {
    it('허용된 변수는 강조 색, 목록에 없는 변수는 경고 색으로 표시된다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={['context']} />);

      await user.click(getTextarea());
      await user.paste('{{#context#}} 그리고 {{#foo#}}');

      expect(screen.getByText('{{#context#}}')).toHaveClass('text-[#4f46e5]');
      expect(screen.getByText('{{#foo#}}')).toHaveClass('text-[#d92d20]');
    });

    it('allowedVariables가 없으면 모든 변수가 기본 강조 색으로 표시된다', async () => {
      const { user } = renderWithUser(<Harness />);

      await user.click(getTextarea());
      await user.paste('{{#anything#}}');

      // textarea의 텍스트 값도 매칭되므로 하이라이트 레이어의 span으로 한정한다
      expect(screen.getByText('{{#anything#}}', { selector: 'span' })).toHaveClass(
        'text-[#4f46e5]'
      );
    });
  });

  describe('변수 선택 팝오버', () => {
    it('"{{" 입력 시 사용 가능한 변수 목록이 열린다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');

      expect(screen.getByText('변수 선택')).toBeInTheDocument();
      expect(screen.getByText('context')).toBeInTheDocument();
      expect(screen.getByText('query')).toBeInTheDocument();
      expect(screen.getByText('memory')).toBeInTheDocument();
    });

    it('트리거 뒤에 입력한 질의로 목록이 필터링된다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{con');

      expect(screen.getByText('변수 선택')).toBeInTheDocument();
      expect(screen.getByText('context')).toBeInTheDocument();
      expect(screen.queryByText('memory')).not.toBeInTheDocument();
    });

    it('질의에 매칭되는 변수가 없으면 팝오버가 표시되지 않는다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{zzz');

      expect(screen.queryByText('변수 선택')).not.toBeInTheDocument();
    });

    it('allowedVariables가 없으면 "{{"를 입력해도 팝오버가 열리지 않는다', async () => {
      const { user } = renderWithUser(<Harness />);

      await typeInEditor(user, '{{{{');

      expect(screen.queryByText('변수 선택')).not.toBeInTheDocument();
    });

    // 버그 의심 — 팀 확인 필요: keydown의 Escape 처리로 닫혀도 onKeyUp의 refreshTrigger가
    // 미완성 트리거('{{')를 다시 감지해 팝오버가 곧바로 다시 열린다. 수정(예: Escape로 닫은
    // 트리거 위치 기억) 시 이 기대값을 not.toBeInTheDocument로 갱신할 것.
    it('Escape로 닫아도 keyup의 트리거 재감지로 팝오버가 다시 열린다 (현재 동작 고정)', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      expect(screen.getByText('변수 선택')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.getByText('변수 선택')).toBeInTheDocument();
      expect(getTextarea()).toHaveValue('{{');
    });

    it('textarea가 blur되면 팝오버가 닫힌다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      expect(screen.getByText('변수 선택')).toBeInTheDocument();

      fireEvent.blur(getTextarea());

      await waitFor(() => {
        expect(screen.queryByText('변수 선택')).not.toBeInTheDocument();
      });
    });
  });

  describe('키보드 내비게이션과 변수 삽입', () => {
    it('Enter로 첫 번째 변수가 삽입되고 트리거 문자가 완성형으로 대체된다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      await user.keyboard('{Enter}');

      expect(getTextarea()).toHaveValue('{{#context#}}');
      expect(screen.queryByText('변수 선택')).not.toBeInTheDocument();
      // 삽입 후 캐럿은 삽입된 변수 바로 뒤로 복원된다
      await waitFor(() => {
        expect(getTextarea().selectionStart).toBe('{{#context#}}'.length);
      });
    });

    // 버그 의심 — 팀 확인 필요: 화살표 keydown이 activeIndex를 옮겨도 이어지는 keyup의
    // refreshTrigger가 setActiveIndex(0)으로 리셋해 Enter는 항상 첫 항목을 삽입한다.
    // 수정(예: 트리거가 동일하면 activeIndex 유지) 시 기대값을 '{{#query#}}'로 갱신할 것.
    it('ArrowDown 선택이 keyup의 activeIndex 리셋으로 무시된다 (현재 동작 고정)', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      await user.keyboard('{ArrowDown}{Enter}');

      expect(getTextarea()).toHaveValue('{{#context#}}');
    });

    // 버그 의심 — 팀 확인 필요: 위와 동일한 리셋으로 ArrowUp 순환도 무시된다.
    // 수정 시 기대값을 '{{#memory#}}'로 갱신할 것.
    it('ArrowUp 순환 선택도 keyup 리셋으로 무시된다 (현재 동작 고정)', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      await user.keyboard('{ArrowUp}{Enter}');

      expect(getTextarea()).toHaveValue('{{#context#}}');
    });

    it('마우스 호버로 항목을 활성화하면 Enter가 그 항목을 삽입한다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');

      // 호버(mouseEnter)와 Enter 사이에는 keyup이 없어 activeIndex가 유지된다
      fireEvent.mouseEnter(screen.getByText('query').closest('button') as HTMLButtonElement);
      await user.keyboard('{Enter}');

      expect(getTextarea()).toHaveValue('{{#query#}}');
    });

    it('Tab으로도 삽입된다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');
      await user.keyboard('{Tab}');

      expect(getTextarea()).toHaveValue('{{#context#}}');
    });

    it('"{{#" 로 시작한 트리거도 중복 # 없이 완성형으로 대체된다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{#qu');
      expect(screen.getByText('변수 선택')).toBeInTheDocument();

      await user.keyboard('{Enter}');

      expect(getTextarea()).toHaveValue('{{#query#}}');
    });

    it('마우스로 항목을 눌러 삽입할 수 있다', async () => {
      const { user } = renderWithUser(<Harness allowedVariables={ALLOWED} />);

      await typeInEditor(user, '{{{{');

      // 실제 컴포넌트는 blur보다 먼저 실행되는 mousedown에서 삽입한다
      fireEvent.mouseDown(screen.getByText('memory').closest('button') as HTMLButtonElement);

      expect(getTextarea()).toHaveValue('{{#memory#}}');
    });

    it('본문 중간의 트리거도 그 위치에서 대체된다', async () => {
      const { user } = renderWithUser(
        <Harness allowedVariables={ALLOWED} initialValue="앞 내용 " />
      );

      const textarea = getTextarea();
      // 캐럿을 끝으로 이동한 뒤 트리거 입력
      await user.click(textarea);
      await user.keyboard('{End}');
      await user.keyboard('{{{{mem');
      await user.keyboard('{Enter}');

      expect(textarea).toHaveValue('앞 내용 {{#memory#}}');
    });
  });
});
