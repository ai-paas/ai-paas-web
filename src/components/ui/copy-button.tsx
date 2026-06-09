import type { CSSProperties } from 'react';
import { useToast } from '@innogrid/ui';

import { IconCopy } from '@/assets/img/icon';
import { cn } from '@/lib/utils';
import { copyTextToClipboard } from '@/util/clipboard';

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

  const handleClick = () => {
    void copyTextToClipboard(value).then((copied) => {
      if (copied) {
        toast.open({ status: 'positive', title: '복사 완료', children: successMessage });
      }
    });
  };

  return (
    <button type="button" className={cn('btn-copy', className)} style={style} onClick={handleClick}>
      <IconCopy />
    </button>
  );
}
