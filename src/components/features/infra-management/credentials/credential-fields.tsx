import { useMemo, useState } from 'react';
import { Button, Input, Password, Textarea } from '@innogrid/ui';
import { useGetProviderCredentialSchema, type CredentialFieldSchema } from '@/hooks/service/providers';

interface Props {
  provider: string;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

/**
 * KEY=VALUE 또는 JSON 을 그대로 받던 자리.
 *
 * <p>키 이름을 외워야 쓸 수 있었고, 오타는 등록을 마친 뒤 프로비저닝이 실패해야 드러났다. 무엇을
 * 받아야 하는지는 백엔드가 알고 있으므로 그 목록으로 칸을 만든다.
 *
 * <p>스키마가 없는 프로바이더도 등록은 되어야 한다 — 직접 입력으로 떨어진다.
 */
export const CredentialFields = ({ provider, value, onChange }: Props) => {
  const { fields, isError } = useGetProviderCredentialSchema(provider, !!provider);
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState('');

  const groups = useMemo(() => {
    const seen = new Map<string, CredentialFieldSchema[]>();
    for (const f of fields) {
      const id = f.group ?? f.key;
      seen.set(id, [...(seen.get(id) ?? []), f]);
    }
    return [...seen.entries()];
  }, [fields]);

  const set = (key: string, next: string) => {
    const merged = { ...value, [key]: next };
    if (!next) delete merged[key];
    onChange(merged);
  };

  const useRaw = rawMode || (isError && fields.length === 0);

  /*
   * 직접 입력으로 넘어가면 키 이름을 다시 찾아다니게 된다 — 항목별 입력을 만든 이유가 사라진다.
   * 고쳐 쓸 수 있는 예제를 미리 채워 준다.
   *
   * <p>이미 넣은 값이 있으면 그것을 이어받는다. 전환할 때마다 예제로 덮으면 쓰던 값을 잃는다.
   * 비밀값 예시는 넣지 않는다 — 그대로 등록하면 가짜 키가 저장된다.
   */
  const rawTemplate = () => {
    if (Object.keys(value).length > 0) return JSON.stringify(value, null, 2);
    if (fields.length === 0) return '';
    const sample = Object.fromEntries(fields.map((f) => [f.key, f.secret ? '' : (f.placeholder ?? '')]));
    return JSON.stringify(sample, null, 2);
  };

  const enterRawMode = () => {
    setRawText(rawTemplate());
    setRawMode(true);
  };

  if (!provider) {
    return (
      <div style={{ fontSize: 13, color: '#6b7280' }}>
        프로바이더를 먼저 선택하면 입력할 항목이 표시됩니다.
      </div>
    );
  }

  if (useRaw) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor="credentials-raw" style={{ fontSize: 13 }}>
          직접 입력 (KEY=VALUE 또는 JSON)
        </label>
        <Textarea
          id="credentials-raw"
          rows={10}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            onChange(parseRaw(e.target.value));
          }}
        />
        {!isError && (
          <div>
            <Button size="small" color="secondary" onClick={() => setRawMode(false)}>
              항목별 입력으로 돌아가기
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map(([id, groupFields]) => (
        <div key={id} className="flex flex-col gap-2">
          {groupFields.length > 1 && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              아래 중 하나만 채우면 됩니다.
            </div>
          )}
          {groupFields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label htmlFor={f.key} style={{ fontSize: 13 }}>
                {f.label}
                {f.required && <span style={{ color: '#dc4646', marginLeft: 2 }}>*</span>}
              </label>
              {f.multiline ? (
                <Textarea
                  id={f.key}
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={6}
                  value={value[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : f.secret ? (
                <Password
                  id={f.key}
                  placeholder={f.placeholder}
                  required={f.required}
                  value={value[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <Input
                  id={f.key}
                  type="text"
                  placeholder={f.placeholder}
                  required={f.required}
                  autoComplete="off"
                  value={value[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.description && (
                <span style={{ fontSize: 12, color: '#6b7280' }}>{f.description}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div>
        <Button size="small" color="secondary" onClick={enterRawMode}>
          직접 입력으로 전환
        </Button>
      </div>
    </div>
  );
};

/** 붙여넣기 모드 — JSON 을 먼저 보고, 아니면 KEY=VALUE 한 줄씩. */
const parseRaw = (raw: string): Record<string, string> => {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)])
      );
    }
  } catch {
    // KEY=VALUE 로 읽는다.
  }
  const out: Record<string, string> = {};
  for (const line of trimmed.split(/\r?\n/)) {
    const eq = line.indexOf('=');
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      if (k) out[k] = line.slice(eq + 1).trim();
    }
  }
  return out;
};
