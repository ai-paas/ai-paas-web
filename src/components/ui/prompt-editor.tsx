import { cn } from '@/lib/utils';
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react';

/** 본문에서 `{{# ... #}}` 변수를 찾아내는 정규식 (추출 로직과 동일 규칙) */
const VARIABLE_RE = /\{\{#\s*([^{}#]+?)\s*#\}\}/g;

interface PromptEditorProps {
  value: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  name?: string;
  /** 에디터 높이 (숫자는 px). 기본 320 */
  height?: number | string;
  /** 사용 가능한 변수명 목록. 지정 시 목록에 없는 변수는 경고 색으로 표시하고, `{{` 입력 시 선택 팝오버를 띄운다. */
  allowedVariables?: string[];
  className?: string;
}

/**
 * 본문 입력 textarea 위에 하이라이트 레이어를 겹쳐 `{{#변수#}}`를 다른 색으로 보여준다.
 * - 뒤쪽 레이어(div)가 같은 텍스트를 그리되 변수만 색을 입힌다.
 * - 앞쪽 textarea 는 글자색을 투명 처리하고 캐럿만 보이게 하여 실제 입력을 담당한다.
 * - 두 레이어의 폰트/패딩/줄간격을 일치시키고 스크롤을 동기화해 위치를 맞춘다.
 * - `{{` 를 입력하면 사용 가능한 변수 선택 팝오버를 캐럿 위치에 띄운다.
 */
function highlight(content: string, allowed?: Set<string>): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (let m = VARIABLE_RE.exec(content); m !== null; m = VARIABLE_RE.exec(content)) {
    if (m.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{content.slice(lastIndex, m.index)}</Fragment>);
    }
    // allowed 가 주어졌고 목록에 없으면 허용되지 않은 변수 → 경고 색으로 표시.
    const isInvalid = allowed !== undefined && !allowed.has(m[1]);
    nodes.push(
      // Dify 스타일 변수 칩. 가로 여백을 주면 뒤쪽 textarea 와 정렬이 어긋나거나(실제 여백)
      // 음수 마진으로 상쇄 시 배경이 이웃 글자를 덮으므로, 배경이 변수 글자에 딱 붙도록 둔다.
      <span
        key={key++}
        className={cn(
          'rounded-sm py-px box-decoration-clone',
          isInvalid ? 'bg-[#fdecec] text-[#d92d20]' : 'bg-[#eef2ff] text-[#4f46e5]'
        )}
      >
        {m[0]}
      </span>
    );
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < content.length) {
    nodes.push(<Fragment key={key++}>{content.slice(lastIndex)}</Fragment>);
  }
  // 마지막 줄이 개행으로 끝나면 빈 줄이 그려지지 않으므로 보정한다.
  if (content.endsWith('\n')) {
    nodes.push(<Fragment key={key++}>{'​'}</Fragment>);
  }

  return nodes;
}

const toCssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

// 두 레이어가 픽셀 단위로 겹치도록 공유하는 텍스트/박스 스타일.
// font-family/letter-spacing 등은 앱 폰트를 그대로 상속해 textarea 기본 폰트와의 불일치를 막는다.
// scrollbar-gutter:stable 로 스크롤바가 생겨도 두 레이어의 줄바꿈 위치가 어긋나지 않게 한다.
const SHARED =
  'm-0 box-border w-full p-3 text-[13px] leading-[1.6] font-[family-name:inherit] tracking-[inherit] whitespace-pre-wrap break-words [scrollbar-gutter:stable]';

/** 캐럿 바로 앞에 닫히지 않은 `{{` 트리거가 있으면 그 시작 위치와 입력 중인 질의를 돌려준다. */
function detectTrigger(value: string, caret: number): { start: number; query: string } | null {
  const before = value.slice(0, caret);
  const open = before.lastIndexOf('{{');
  if (open === -1) return null;

  let between = before.slice(open + 2);
  // 이미 닫혔거나 변수명 구분자(#)·중괄호·개행이 들어오면 트리거 대상이 아니다.
  if (between.includes('}}') || between.includes('{') || between.includes('\n')) return null;
  if (between.startsWith('#')) between = between.slice(1);
  if (between.includes('#')) return null;

  return { start: open, query: between };
}

// textarea 내부 caret 위치(px)를 계산하기 위해 동일 스타일의 임시 mirror div 를 만들어 측정한다.
const CARET_STYLE_PROPS = [
  'box-sizing',
  'width',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'line-height',
  'tab-size',
  'text-indent',
  'white-space',
  'word-wrap',
  'overflow-wrap',
  'word-break',
];

function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const computed = getComputedStyle(textarea);
  for (const prop of CARET_STYLE_PROPS) {
    div.style.setProperty(prop, computed.getPropertyValue(prop));
  }
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.height = 'auto';

  div.textContent = textarea.value.slice(0, position);
  const marker = document.createElement('span');
  // 빈 문자열이면 위치를 못 잡으므로 placeholder 문자를 둔다.
  marker.textContent = textarea.value.slice(position) || '.';
  div.appendChild(marker);

  document.body.appendChild(div);
  const top = marker.offsetTop;
  const left = marker.offsetLeft;
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.4;
  document.body.removeChild(div);

  return { top, left, lineHeight };
}

export function PromptEditor({
  value,
  onChange,
  placeholder,
  name,
  height = 320,
  allowedVariables,
  className,
}: PromptEditorProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const allowedSet = allowedVariables ? new Set(allowedVariables) : undefined;

  const [trigger, setTrigger] = useState<{ start: number; query: string } | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  // 팝오버에 표시할, 질의로 필터링된 변수 목록.
  const suggestions =
    trigger && allowedVariables
      ? allowedVariables.filter((v) => v.toLowerCase().includes(trigger.query.toLowerCase()))
      : [];
  const isOpen = trigger !== null && suggestions.length > 0;

  // 삽입 직후 caret 위치를 복원한다 (value 가 부모를 통해 갱신된 뒤 적용).
  useEffect(() => {
    if (pendingCaret.current === null || !textareaRef.current) return;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos);
  }, [value]);

  const refreshTrigger = () => {
    const ta = textareaRef.current;
    if (!ta || !allowedVariables || allowedVariables.length === 0) {
      setTrigger(null);
      return;
    }
    const next = detectTrigger(ta.value, ta.selectionStart ?? 0);
    if (!next) {
      setTrigger(null);
      return;
    }
    const c = getCaretCoordinates(ta, next.start);
    setCoords({ top: c.top - ta.scrollTop + c.lineHeight, left: c.left - ta.scrollLeft });
    setTrigger(next);
    setActiveIndex(0);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    refreshTrigger();
  };

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    const layer = highlightRef.current;
    if (layer) {
      layer.scrollTop = e.currentTarget.scrollTop;
      layer.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (trigger) refreshTrigger();
  };

  const insertVariable = (variableName: string) => {
    const ta = textareaRef.current;
    if (!ta || !trigger) return;
    const caret = ta.selectionStart ?? value.length;
    const insertText = `{{#${variableName}#}}`;
    const nextValue = value.slice(0, trigger.start) + insertText + value.slice(caret);
    pendingCaret.current = trigger.start + insertText.length;
    onChange?.({
      target: { name: ta.name, value: nextValue },
    } as unknown as ChangeEvent<HTMLTextAreaElement>);
    setTrigger(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertVariable(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTrigger(null);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div
        style={{ height: toCssSize(height) }}
        className="relative overflow-hidden rounded border border-[#DEDEDE] bg-white"
      >
        <div
          ref={highlightRef}
          aria-hidden
          className={cn(SHARED, 'pointer-events-none absolute inset-0 overflow-auto text-[#24292f]')}
        >
          {highlight(value, allowedSet)}
        </div>
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onClick={refreshTrigger}
          onKeyUp={refreshTrigger}
          onBlur={() => setTrigger(null)}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            SHARED,
            'absolute inset-0 resize-none overflow-auto border-0 bg-transparent text-transparent caret-[#24292f] outline-none placeholder:text-[#999]'
          )}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-10 w-72 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="border-b border-[#F0F0F0] px-3 py-2 text-xs font-medium text-[#888]">
            변수 선택
          </div>
          <ul className="max-h-64 overflow-auto py-1">
            {suggestions.map((variableName, index) => (
              <li key={variableName}>
                <button
                  type="button"
                  // mousedown 에서 textarea blur 가 먼저 일어나 팝오버가 닫히는 것을 막는다.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertVariable(variableName);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                    index === activeIndex ? 'bg-[#eef2ff]' : 'bg-white'
                  )}
                >
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-[#eef2ff] text-sm font-semibold text-[#4f46e5]">
                    #
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-[#24292f]">{variableName}</span>
                    <span className="truncate text-xs text-[#999]">{`{{#${variableName}#}}`}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 border-t border-[#F0F0F0] px-3 py-1.5 text-[11px] text-[#aaa]">
            <span>↑↓ 이동</span>
            <span>Enter 선택</span>
            <span>Esc 닫기</span>
          </div>
        </div>
      )}
    </div>
  );
}
