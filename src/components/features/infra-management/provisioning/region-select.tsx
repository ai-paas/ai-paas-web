import { useEffect, useMemo } from 'react';
import { Select, type SelectSingleValue } from '@innogrid/ui';
import { useGetProviderRegions } from '@/hooks/service/providers';
import { regionLabel } from '@/util/region-labels';

interface RegionSelectProps {
  provider?: string;
  credentialId?: string;
  value?: string;
  onChange: (regionId: string) => void;
  defaultRegionId?: string;
  errorText?: string;
}

type Option = { text: string; value: string };

export const RegionSelect = ({
  provider,
  credentialId,
  value,
  onChange,
  defaultRegionId,
  errorText,
}: RegionSelectProps) => {
  // 리전은 CSP API 로 실시간 조회한다. 자격증명이 없으면 빈 목록이 오고, 사용자는 뭘 고르는지
  // 모른 채 고른 뒤 PROVISION 에서 실패한다. 자격증명이 정해진 뒤에만 연다.
  const ready = !!provider && !!credentialId;
  const { regions, isPending, isError } = useGetProviderRegions(provider, credentialId, ready);

  const options = useMemo<Option[]>(
    () =>
      regions.map((r) => ({
        // CSP 가 주는 name 은 쓸모가 제각각이다 — OCI 는 리전 키(NRT)를 준다.
        text: regionLabel(r.id),
        value: r.id,
      })),
    [regions]
  );

  useEffect(() => {
    if (value || !defaultRegionId || options.length === 0) return;
    if (options.some((o) => o.value === defaultRegionId)) {
      onChange(defaultRegionId);
    }
  }, [value, defaultRegionId, options, onChange]);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const disabled = !ready;
  const isEmpty = ready && !isPending && options.length === 0;

  return (
    <div>
      <Select
        options={options}
        getOptionLabel={(o) => o.text}
        getOptionValue={(o) => o.value}
        value={selected ?? null}
        onChange={(opt: SelectSingleValue<Option>) => onChange(opt?.value ?? '')}
        placeholder={
          !provider
            ? '프로바이더를 먼저 선택해주세요.'
            : !credentialId
              ? '자격증명을 먼저 선택해주세요.'
              : isPending
                ? '리전 조회 중... (CSP API 호출)'
                : isError
                  ? '리전을 불러오지 못했습니다.'
                  : isEmpty
                    ? '사용 가능한 리전이 없습니다.'
                    : '리전을 선택해주세요.'
        }
        isDisabled={disabled || isPending || isError}
        styles={{
          control: (base) => ({ ...base, width: '100%', minHeight: '40px' }),
          container: (base) => ({ ...base, width: '100%' }),
        }}
      />
      {isError && (
        <p className="page-input_item-input-error">
          리전 조회 실패 — 자격증명 권한 또는 CSP 응답을 확인해주세요.
        </p>
      )}
      {errorText && <p className="page-input_item-input-error">{errorText}</p>}
    </div>
  );
};