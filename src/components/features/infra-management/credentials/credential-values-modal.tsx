import { useEffect, useState } from 'react';
import { Button, Modal, useToast } from '@innogrid/ui';
import { revealCredential } from '@/hooks/service/credentials';
import { copyTextToClipboard } from '@/util/clipboard';
import { getServerErrorMessage } from '@/lib/api';

interface Props {
  isOpen: boolean;
  credentialId: string;
  credentialName: string;
  keys: string[];
  onClose: () => void;
}

/**
 * 등록된 값 열람.
 *
 * <p>목록에 펼쳐두면 키가 많은 자격증명(OpenStack 은 11개)이 행 높이를 밀어내 표가 읽히지 않는다.
 *
 * <p>값은 목록 응답에 없다 — 전용 경로로만 나오고 누가 언제 봤는지 감사 로그에 남는다. 그래서
 * 창을 여는 것만으로는 부르지 않고, 닫으면 메모리에서도 버린다.
 */
export const CredentialValuesModal = ({
  isOpen,
  credentialId,
  credentialName,
  keys,
  onClose,
}: Props) => {
  const { open } = useToast();
  const [values, setValues] = useState<Record<string, string>>();
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) {
      setValues(undefined);
      setShown(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ensureValues = async () => {
    if (values) return values;
    setLoading(true);
    try {
      const loaded = await revealCredential(credentialId);
      setValues(loaded);
      return loaded;
    } catch (e) {
      open({ title: getServerErrorMessage(e, '값을 불러오지 못했습니다.'), status: 'negative' });
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (key: string) => {
    if (shown.has(key)) {
      setShown((prev) => {
        const next = new Set(prev);
        next.delete(key);
        if (next.size === 0) setValues(undefined);
        return next;
      });
      return;
    }
    if (!(await ensureValues())) return;
    setShown((prev) => new Set(prev).add(key));
  };

  const copy = async (key: string) => {
    const loaded = await ensureValues();
    const value = loaded?.[key];
    if (value === undefined) return;
    const ok = await copyTextToClipboard(value);
    open({
      title: ok ? `${key} 값을 복사했습니다.` : '복사하지 못했습니다.',
      status: ok ? 'positive' : 'negative',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`등록된 값 — ${credentialName}`}
      size="medium"
      onRequestClose={onClose}
      action={onClose}
      buttonTitle="닫기"
    >
      <div className="credential-values">
        {keys.map((key) => (
          <div key={key} className="credential-values-row">
            <span className="credential-values-key" title={key}>
              {key}
            </span>
            <span className="credential-values-value">
              {shown.has(key) ? (values?.[key] ?? '') : '••••••••'}
            </span>
            <Button
              size="small"
              color="secondary"
              disabled={loading || !credentialId}
              onClick={() => void toggle(key)}
            >
              {shown.has(key) ? '가리기' : '보기'}
            </Button>
            <Button
              size="small"
              color="secondary"
              disabled={loading || !credentialId}
              onClick={() => void copy(key)}
            >
              복사
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};
