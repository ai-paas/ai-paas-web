import { Input, Select, type SelectSingleValue } from '@innogrid/ui';
import { useEffect, useMemo } from 'react';

import {
  useGetProviderConfigSchema,
  type ProviderConfigSchemaField,
} from '@/hooks/service/providers';

/** 이 접두를 가진 키만 CSP 고유 값이다. 나머지는 이름, 리전, 노드 구성이 이미 받는다. */
const PROVIDER_SPEC_PREFIX = 'anycloud-k8s:providerSpec.';

export type ProviderSpecValues = Record<string, string>;

interface SpecOption {
  label: string;
  value: string;
}

/** `anycloud-k8s:providerSpec.zone` → `zone`. 서버가 받는 providerSpec 의 필드 이름이다. */
export const providerSpecFieldName = (key: string) => key.slice(PROVIDER_SPEC_PREFIX.length);

const isProviderSpecKey = (field: ProviderConfigSchemaField) =>
  field.key.startsWith(PROVIDER_SPEC_PREFIX);

/** 채워야 하는데 비어 있는 필드 이름. 호출부가 제출 전에 막는 데 쓴다. */
export const missingProviderSpecFields = (
  fields: ProviderConfigSchemaField[],
  values: ProviderSpecValues
) =>
  fields
    .filter((f) => isProviderSpecKey(f) && f.required)
    .map((f) => providerSpecFieldName(f.key))
    .filter((name) => !values[name]?.trim());

interface Props {
  provider?: string;
  values: ProviderSpecValues;
  onChange: (values: ProviderSpecValues) => void;
  /** 제출을 시도한 뒤에만 비어 있는 칸을 빨갛게 표시한다. */
  showErrors?: boolean;
}

/**
 * CSP 고유 설정 입력.
 *
 * 어떤 칸이 필요한지는 백엔드 config-schema 가 정한다. 화면에 CSP 별 분기를 두면 프로바이더가
 * 늘 때마다 같은 목록을 두 곳에서 관리하게 되고, 한쪽만 고쳐 생성이 조용히 실패한다.
 */
export const ProviderSpecFields = ({ provider, values, onChange, showErrors }: Props) => {
  const { fields, isPending } = useGetProviderConfigSchema(provider, !!provider);

  const specFields = useMemo(() => fields.filter(isProviderSpecKey), [fields]);

  // 스키마가 주는 기본값은 한 번만 채운다. 사용자가 지운 칸을 되살리면 안 된다.
  useEffect(() => {
    const seeded: ProviderSpecValues = {};
    for (const field of specFields) {
      const name = providerSpecFieldName(field.key);
      if (values[name] === undefined && field.defaultValue) seeded[name] = field.defaultValue;
    }
    if (Object.keys(seeded).length > 0) onChange({ ...values, ...seeded });
    // values 를 의존성에 넣으면 사용자가 지울 때마다 기본값이 되돌아온다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specFields]);

  if (!provider || (isPending && specFields.length === 0)) return null;
  if (specFields.length === 0) return null;

  const set = (name: string, value: string) => onChange({ ...values, [name]: value });

  return (
    <>
      {specFields.map((field) => {
        const name = providerSpecFieldName(field.key);
        const value = values[name] ?? '';
        const invalid = !!showErrors && !!field.required && !value.trim();
        const options = field.allowedValues ?? [];

        return (
          <div className="page-input_item-box" key={field.key}>
            <div
              className={`page-input_item-name${field.required ? ' page-icon-requisite' : ''}`}
            >
              {name}
            </div>
            <div className="page-input_item-data">
              {options.length > 0 ? (
                <Select
                  options={options.map((o) => ({ label: o, value: o }))}
                  value={options.includes(value) ? { label: value, value } : undefined}
                  onChange={(selected) =>
                    set(name, (selected as SelectSingleValue<SpecOption>)?.value ?? '')
                  }
                />
              ) : (
                <Input
                  placeholder={field.description ?? name}
                  value={value}
                  onChange={(e) => set(name, e.target.value)}
                  variant={invalid ? 'err' : 'default'}
                />
              )}
              {invalid ? (
                <p className="page-input_item-input-error">{name} 을(를) 입력해주세요.</p>
              ) : (
                field.description && <p className="page-input_item-input-desc">{field.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
