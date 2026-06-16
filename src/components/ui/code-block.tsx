import { IconCopy, IconDocument } from '@/assets/img/icon';
import { cn } from '@/lib/utils';
import { copyTextToClipboard } from '@/util/clipboard';
import { Fragment, useState, type ReactNode } from 'react';

interface CodeBlockProps {
  /** 표시할 코드 문자열 */
  code: string;
  /** 코드 언어 라벨 (헤더에 표시). 미지정 시 'CODE' */
  language?: string;
  /** 코드가 없을 때 보여줄 문구 */
  emptyText?: string;
  /** 줄 번호 표시 여부 */
  showLineNumbers?: boolean;
  /** 최소 너비 (기본 720px). 숫자는 px 로 처리 */
  minWidth?: number | string;
  /** 최대 너비 (기본 '100%'). 숫자는 px 로 처리 */
  maxWidth?: number | string;
  className?: string;
}

const toCssSize = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

/**
 * 언어를 특정할 수 없는 코드를 위한 경량 토크나이저.
 * 대부분의 언어에 공통인 토큰(주석/문자열/숫자/공통 키워드)만 색칠한다.
 * 정확한 파싱이 목적이 아니라 "코드처럼" 보이게 하는 것이 목적이며,
 * 어떤 입력에도 예외 없이 동작하도록 한다.
 */
const KEYWORDS = new Set([
  // 선언/모듈
  'import', 'from', 'as', 'export', 'package', 'use', 'using', 'require', 'include',
  'def', 'function', 'func', 'fn', 'class', 'struct', 'interface', 'enum', 'type',
  'const', 'let', 'var', 'val', 'static', 'final', 'public', 'private', 'protected',
  'abstract', 'extends', 'implements', 'namespace', 'module',
  // 흐름 제어
  'return', 'if', 'else', 'elif', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'goto', 'yield', 'match', 'when',
  'try', 'catch', 'except', 'finally', 'throw', 'throws', 'raise', 'with',
  // 논리/연산
  'in', 'is', 'not', 'and', 'or', 'new', 'delete', 'del', 'typeof', 'instanceof',
  'void', 'async', 'await', 'lambda', 'pass', 'this', 'self', 'super', 'global', 'nonlocal',
  // 리터럴
  'true', 'false', 'null', 'nil', 'none', 'undefined', 'True', 'False', 'None',
]);

const TOKEN_RE =
  /(#.*|\/\/.*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)/g;

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (let m = TOKEN_RE.exec(code); m !== null; m = TOKEN_RE.exec(code)) {
    const [match, comment, str, num, word] = m;

    if (m.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{code.slice(lastIndex, m.index)}</Fragment>);
    }

    if (comment !== undefined) {
      nodes.push(
        <span key={key++} className="text-[#6e7781] italic">
          {match}
        </span>
      );
    } else if (str !== undefined) {
      nodes.push(
        <span key={key++} className="text-[#0a3069]">
          {match}
        </span>
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={key++} className="text-[#0550ae]">
          {match}
        </span>
      );
    } else if (word !== undefined && KEYWORDS.has(word)) {
      nodes.push(
        <span key={key++} className="text-[#cf222e]">
          {match}
        </span>
      );
    } else {
      nodes.push(<Fragment key={key++}>{match}</Fragment>);
    }

    lastIndex = m.index + match.length;
  }

  if (lastIndex < code.length) {
    nodes.push(<Fragment key={key++}>{code.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

export function CodeBlock({
  code,
  language,
  emptyText = '등록된 샘플 코드가 없습니다.',
  showLineNumbers = true,
  minWidth = 720,
  maxWidth = '100%',
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const sizeStyle = { minWidth: toCssSize(minWidth), maxWidth: toCssSize(maxWidth) };

  const trimmed = code?.trim() ?? '';
  const hasCode = trimmed.length > 0;
  const lines = trimmed.split('\n');

  const handleCopy = () => {
    if (!hasCode) return;
    void copyTextToClipboard(trimmed).then((copied) => {
      if (!copied) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!hasCode) {
    return (
      <div
        style={sizeStyle}
        className={cn(
          'flex w-fit flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[#DEDEDE] bg-[#FAFAFA] px-6 py-12',
          className
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2F2] [&>svg]:h-6 [&>svg]:w-6 [&>svg]:opacity-25">
          <IconDocument />
        </span>
        <p className="text-sm text-[#999]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div
      style={sizeStyle}
      className={cn('w-fit overflow-hidden rounded-md border border-[#DEDEDE] bg-[#F2F2F2]', className)}
    >
      <div className="flex items-center justify-between border-b border-[#DEDEDE] px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-[#57606a] uppercase">
          {language ?? 'CODE'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[#57606a] transition-colors hover:bg-[#E5E5E5] hover:text-[#24292f]"
        >
          <IconCopy />
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-[1.6]">
        <code className="block font-mono text-[#24292f]">
          {lines.map((line, index) => (
            <span key={index} className="grid grid-cols-[auto_1fr] gap-4">
              {showLineNumbers && (
                <span className="text-right text-[#8c959f] select-none">{index + 1}</span>
              )}
              <span className="whitespace-pre">{line ? highlight(line) : ' '}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
