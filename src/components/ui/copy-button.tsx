import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@innogrid/ui';

import { IconCheck, IconCopy } from '@/assets/img/icon';
import { cn } from '@/lib/utils';
import { copyTextToClipboard } from '@/util/clipboard';

/** 복사 성공 후 체크 아이콘을 보여주는 시간(ms) */
const COPIED_FEEDBACK_DURATION = 2000;

interface CopyButtonProps {
  /** 복사할 값 */
  value: string;
  className?: string;
  style?: CSSProperties;
  /** 복사 성공 토스트 메시지 */
  successMessage?: string;
}

/**
 * 클릭 시 value 를 클립보드에 복사하고, 성공하면 토스트로 알린다.
 */
export function CopyButton({
  value,
  className,
  style,
  successMessage = '클립보드에 복사되었습니다.',
}: CopyButtonProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = () => {
    void copyTextToClipboard(value).then((isCopied) => {
      if (isCopied) {
        toast.open({ status: 'positive', title: '복사 완료', children: successMessage });
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_DURATION);
      }
    });
  };

  return (
    <button
      type="button"
      className={cn('btn-copy', copied && 'is-copied', className)}
      style={style}
      onClick={handleClick}
      aria-label={copied ? '복사됨' : '복사'}
    >
      {copied ? <IconCheck /> : <IconCopy />}
    </button>
  );
}
