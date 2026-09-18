import { Input } from '@innogrid/ui';

/** {@link SpecPicker} 가 쓰는 오류 문구 자리와 같은 모양을 유지한다. */
type Props = {
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
};

const PATTERN = /^\d+-\d+$/;

/**
 * Proxmox 노드 사양 입력.
 *
 * <p>Proxmox 는 인스턴스 타입이 없어 조회할 목록이 없다. 코어 수와 메모리(MiB)를 하이픈으로 이어
 * 받고, emitter 가 그대로 나눠 쓴다.
 */
export function ProxmoxSpecInput({ value, onChange, errorText }: Props) {
  const malformed = value.length > 0 && !PATTERN.test(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <Input
        placeholder="코어-메모리MiB (예: 2-4096)"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        aria-label="Proxmox 노드 사양"
      />
      {malformed && (
        <p className="page-input_item-input-error">
          {'"코어-메모리MiB" 형식이어야 합니다. 예: 4-8192 는 4 코어, 8 GiB'}
        </p>
      )}
      {!malformed && errorText && <p className="page-input_item-input-error">{errorText}</p>}
    </div>
  );
}
