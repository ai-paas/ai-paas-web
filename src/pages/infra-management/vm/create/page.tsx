import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadCrumb, Button, Input, Select, type SelectSingleValue, useToast } from '@innogrid/ui';
import { useCreateVm } from '@/hooks/service/vms';
import type { ClusterSpecRequest } from '@/types/vm';
import {
  useGetProviderImages,
  useGetProviderSpecs,
  type ProviderSpec,
} from '@/hooks/service/providers';
import {
  CSP_OPTIONS,
  CspSelector,
} from '@/components/features/infra-management/credentials/csp-selector';
import { CredentialSelect } from '@/components/features/infra-management/provisioning/credential-select';
import { CredentialCreateModal } from '@/components/features/infra-management/credentials/credential-create-modal';
import {
  ProviderSpecFields,
  missingProviderSpecFields,
  type ProviderSpecValues,
} from '@/components/features/infra-management/provisioning/provider-spec-fields';
import { RegionSelect } from '@/components/features/infra-management/provisioning/region-select';
import { useGetProviderConfigSchema } from '@/hooks/service/providers';
import { SpecPicker } from '@/components/features/infra-management/provisioning/spec-picker';
import { NodeComposition } from '@/components/features/infra-management/provisioning/node-composition';
import { isGpuSpec } from '@/util/gpuInstance';
import { errorDetail, errorHint, errorMessage } from '@/util/api-error';
import styles from '../../cluster-management/create/page.module.scss';

type OptionType = { text: string; value: string };

const environmentOptions: OptionType[] = [
  { text: 'dev', value: 'dev' },
  { text: 'stage', value: 'stage' },
  { text: 'prod', value: 'prod' },
];

const DEFAULT_REGION_BY_PROVIDER: Record<string, string> = {
  aws: 'us-east-1',
  gcp: 'us-central1',
  azure: 'eastus',
  ncp: 'KR',
};

type ValidationErrors = {
  vmGroupName?: string;
  provider?: string;
  region?: string;
  providerSpec?: string;
  credentialId?: string;
  masterSpec?: string;
  workerSpec?: string;
};

export default function ProvisioningCreatePage() {
  const navigate = useNavigate();
  const { open } = useToast();

  const [vmGroupName, setVmGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState<string>('');
  const [credentialId, setCredentialId] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [providerSpec, setProviderSpec] = useState<ProviderSpecValues>({});
  const { fields: configSchemaFields } = useGetProviderConfigSchema(provider, !!provider, {
    credentialId: credentialId || undefined,
    region: region || undefined,
  });
  const [environment, setEnvironment] = useState<OptionType>(environmentOptions[0]);
  const [masterCount, setMasterCount] = useState<1 | 3>(1);
  const [workerCount, setWorkerCount] = useState<number>(3);
  const [masterSpecId, setMasterSpecId] = useState<string>('');
  const [workerSpecId, setWorkerSpecId] = useState<string>('');
  const [osImageId, setOsImageId] = useState<string>('');
  // 만들자마자 모니터링 화면을 여는 것이 보통이라 켜둔다. 자원이 아까운 쪽이 끈다.
  const [enableMonitoring, setEnableMonitoring] = useState(true);
  // hasGpuNodes 는 master/worker spec 의 gpuCount + instance type prefix 로 자동 derive.
  // 사용자 manual toggle 제거 — UI 우회 방지를 위해 server 측도 같은 derive 적용 권장 (별 PR).
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<{
    message: string;
    hint: string;
    detail: string;
  }>();

  // master / worker 의 선택된 spec 풀 details — node-composition 시각화용
  const { specs: allSpecs } = useGetProviderSpecs(
    { provider, credentialId, region, limit: 100 },
    !!provider
  );
  const masterSpecDetail = useMemo<ProviderSpec | undefined>(
    () => allSpecs.find((s) => s.id === masterSpecId),
    [allSpecs, masterSpecId]
  );
  const workerSpecDetail = useMemo<ProviderSpec | undefined>(
    () => allSpecs.find((s) => s.id === workerSpecId),
    [allSpecs, workerSpecId]
  );

  const [imageKeyword, setImageKeyword] = useState('');
  const imagesEnabled = !!provider && !!credentialId && !!region;
  const {
    images,
    isPending: isImagesPending,
    isError: isImagesError,
  } = useGetProviderImages(
    { provider, credentialId, region, keyword: imageKeyword || undefined, limit: 50 },
    imagesEnabled
  );
  const imageOptions = useMemo<OptionType[]>(
    () => images.map((i) => ({ text: i.name ?? i.id, value: i.id })),
    [images]
  );
  const selectedImage = useMemo(
    () => imageOptions.find((o) => o.value === osImageId) ?? null,
    [imageOptions, osImageId]
  );
  const imagePlaceholder = !provider
    ? '프로바이더 선택 필요'
    : !credentialId
      ? '자격증명 선택 필요'
      : !region
        ? '리전 선택 필요'
        : isImagesPending
          ? '이미지 조회 중...'
          : isImagesError
            ? '이미지 조회 실패 — 권한/리전 확인'
            : imageOptions.length === 0
              ? '검색어로 이미지를 찾아보세요.'
              : '이미지 선택 (미선택 시 CSP 기본)';

  const handleSuccess = useCallback(() => {
    open({ title: 'VM 프로비저닝 요청이 수락되었습니다.' });
    navigate('/infra-management/vm');
  }, [open, navigate]);

  const handleError = useCallback(
    (error: unknown) => {
      // 백엔드가 분류한 "할 일" 이 있으면 먼저 보여준다. CSP 원문은 그대로 보면 무엇을
      // 고쳐야 하는지 알 수 없다.
      const hint = errorHint(error);
      open({
        title: errorMessage(error, '요청 실패'),
        description: hint || undefined,
        status: 'negative',
      });
      setSubmitError({
        message: errorMessage(error, '요청 실패'),
        hint,
        detail: errorDetail(error),
      });
    },
    [open]
  );

  const { createVm, isPending } = useCreateVm({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const onProviderChange = (v: string) => {
    setProvider(v);
    // CSP 변경 → 하위 선택 reset (다른 CSP 의 region/spec 은 호환 안 됨)
    setCredentialId('');
    setRegion('');
    setMasterSpecId('');
    setWorkerSpecId('');
    setOsImageId('');
    setProviderSpec({});
    setErrors((p) => ({ ...p, provider: undefined }));
  };

  const onCredentialChange = (v: string) => {
    setCredentialId(v);
    setRegion('');
    setMasterSpecId('');
    setWorkerSpecId('');
    setOsImageId('');
    setErrors((p) => ({ ...p, credentialId: undefined }));
  };

  const onRegionChange = (v: string) => {
    setRegion(v);
    setMasterSpecId('');
    setWorkerSpecId('');
    setOsImageId('');
    setErrors((p) => ({ ...p, region: undefined }));
  };

  const validate = (): boolean => {
    const next: ValidationErrors = {};
    if (!vmGroupName) next.vmGroupName = 'VM 그룹 이름을 입력해주세요.';
    if (!provider) next.provider = 'CSP 를 선택해주세요.';
    if (!credentialId) next.credentialId = '자격증명을 선택해주세요.';
    if (!region) next.region = '리전을 선택해주세요.';
    if (!masterSpecId) next.masterSpec = 'master 인스턴스 타입을 선택해주세요.';
    if (!workerSpecId) next.workerSpec = 'worker 인스턴스 타입을 선택해주세요.';
    // CSP 고유 값은 서버가 preflight 에서 거절한다. 여기서 막아야 생성 버튼을 누르기 전에 안다.
    const missingSpec = missingProviderSpecFields(configSchemaFields, providerSpec);
    if (missingSpec.length > 0) next.providerSpec = `${missingSpec.join(', ')} 을(를) 입력해주세요.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const masterSpecDetailFull = useMemo(
    () => allSpecs.find((s) => s.id === masterSpecId),
    [allSpecs, masterSpecId]
  );
  const workerSpecDetailFull = useMemo(
    () => allSpecs.find((s) => s.id === workerSpecId),
    [allSpecs, workerSpecId]
  );
  const hasGpuNodes = useMemo(
    () => isGpuSpec(provider, masterSpecDetailFull) || isGpuSpec(provider, workerSpecDetailFull),
    [provider, masterSpecDetailFull, workerSpecDetailFull]
  );

  const handleSubmit = () => {
    if (!validate()) return;

    const spec: ClusterSpecRequest = {
      masterCount,
      workerCount,
      masterInstanceType: masterSpecId,
      workerInstanceType: workerSpecId,
    };
    if (osImageId) spec.osImage = osImageId;
    // 켜는 것이 기본이라 끌 때만 보낸다. 기본값 판단은 백엔드 한 곳에 둔다.
    if (!enableMonitoring) spec.enableMonitoring = false;

    createVm({
      vmGroupName,
      provider: provider.toLowerCase(),
      region,
      environment: environment.value || undefined,
      credentialId,
      description: description || undefined,
      spec,
      providerSpec: Object.keys(providerSpec).length > 0 ? providerSpec : undefined,
      hasGpuNodes,
    });
  };

  const providerLabel = CSP_OPTIONS.find((o) => o.value === provider)?.label;

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '인프라 관리' },
            { label: 'VM', path: '/infra-management/vm' },
            { label: 'VM 프로비저닝 생성' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">VM 프로비저닝 생성</h2>
      </div>

      <div className="page-content page-pb-40">
        {submitError && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              borderRadius: 6,
            }}
          >
            <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: 13 }}>
              {submitError.message}
            </div>
            {submitError.hint && (
              <div style={{ marginTop: 6, fontSize: 13, color: '#7f1d1d' }}>{submitError.hint}</div>
            )}
            {submitError.detail && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, color: '#991b1b', cursor: 'pointer' }}>
                  원본 메시지
                </summary>
                <pre
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: '#7f1d1d',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {submitError.detail}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="page-input-box">
          {/* 1. VM 그룹 이름 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">VM 그룹 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="master + worker 인스턴스 집합 식별자 (RFC 1123 label). K8s cluster 도 동일 이름."
                value={vmGroupName}
                onChange={(e) => {
                  setVmGroupName(e.target.value);
                  if (e.target.value) setErrors((p) => ({ ...p, vmGroupName: undefined }));
                }}
                variant={errors.vmGroupName ? 'err' : 'default'}
              />
              {errors.vmGroupName && (
                <p className="page-input_item-input-error">{errors.vmGroupName}</p>
              )}
            </div>
          </div>

          {/* 2. 설명 (이름 직하) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Input
                placeholder="VM 그룹 / 클러스터 용도 설명 (선택)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* 3. CSP 선택 (카드) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">CSP</div>
            <div className="page-input_item-data">
              <CspSelector value={provider} onChange={onProviderChange} />
              {errors.provider && <p className="page-input_item-input-error">{errors.provider}</p>}
            </div>
          </div>

          {/* 4. 자격증명 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">자격증명</div>
            <div className="page-input_item-data">
              <CredentialSelect
                provider={provider}
                value={credentialId}
                onChange={onCredentialChange}
                onRequestRegister={() => setCredentialModalOpen(true)}
                errorText={errors.credentialId}
              />
            </div>
          </div>

          {/* 5. 리전 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">리전</div>
            <div className="page-input_item-data">
              <RegionSelect
                provider={provider}
                credentialId={credentialId || undefined}
                value={region}
                onChange={onRegionChange}
                defaultRegionId={DEFAULT_REGION_BY_PROVIDER[provider ?? '']}
                errorText={errors.region}
              />
            </div>
          </div>

          {/* 5-1. CSP 고유 설정 — 어떤 칸이 뜨는지는 백엔드 config-schema 가 정한다 */}
          <ProviderSpecFields
            provider={provider || undefined}
            credentialId={credentialId || undefined}
            region={region || undefined}
            values={providerSpec}
            onChange={setProviderSpec}
            showErrors={!!errors.providerSpec}
          />
          {errors.providerSpec && (
            <div className="page-input_item-box">
              <div className="page-input_item-name" />
              <div className="page-input_item-data">
                <p className="page-input_item-input-error">{errors.providerSpec}</p>
              </div>
            </div>
          )}

          {/* 6. 환경 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">환경</div>
            <div className="page-input_item-data">
              <div className={styles.selectContainer} style={{ width: '100%' }}>
                <Select
                  options={environmentOptions}
                  getOptionLabel={(o) => o.text}
                  getOptionValue={(o) => o.value}
                  value={environment ?? null}
                  onChange={(opt: SelectSingleValue<OptionType>) =>
                    setEnvironment(opt ?? environmentOptions[0])
                  }
                  styles={{
                    control: (base) => ({ ...base, width: '100%', minHeight: '40px' }),
                    container: (base) => ({ ...base, width: '100%' }),
                  }}
                />
              </div>
            </div>
          </div>

          {/* 7. 노드 구성 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">노드 구성</div>
            <div className="page-input_item-data">
              <NodeComposition
                masterCount={masterCount}
                workerCount={workerCount}
                onMasterCountChange={setMasterCount}
                onWorkerCountChange={setWorkerCount}
                masterSpec={masterSpecDetail}
                workerSpec={workerSpecDetail}
              />
            </div>
          </div>

          {/* 8. Master 인스턴스 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">Master 인스턴스</div>
            <div className="page-input_item-data">
              <SpecPicker
                provider={provider}
                credentialId={credentialId || undefined}
                region={region || undefined}
                value={masterSpecId}
                onChange={(v) => {
                  setMasterSpecId(v);
                  setErrors((p) => ({ ...p, masterSpec: undefined }));
                }}
                showGpuToggle={false}
                errorText={errors.masterSpec}
              />
            </div>
          </div>

          {/* 9. Worker 인스턴스 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">Worker 인스턴스</div>
            <div className="page-input_item-data">
              <SpecPicker
                provider={provider}
                credentialId={credentialId || undefined}
                region={region || undefined}
                value={workerSpecId}
                onChange={(v) => {
                  setWorkerSpecId(v);
                  setErrors((p) => ({ ...p, workerSpec: undefined }));
                }}
                showGpuToggle={true}
                errorText={errors.workerSpec}
              />
            </div>
          </div>

          {/* 10. 고급 옵션 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">고급 옵션</div>
            <div className="page-input_item-data">
              <button
                type="button"
                className="page-disclosure-btn"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((v) => !v)}
              >
                {/* 화살표를 글자로 쓰면 글꼴마다 크기와 정렬이 달라진다. 도형으로 그린다. */}
                <svg
                  className={`page-disclosure-caret${advancedOpen ? 'is-open' : ''}`}
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  aria-hidden="true"
                >
                  <path d="M2 0 L7 4 L2 8 Z" fill="currentColor" />
                </svg>
                {advancedOpen ? '접기' : '펼치기'}
              </button>
              {advancedOpen && (
                <div style={{ marginTop: 12, display: 'grid', rowGap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                      OS 이미지 {providerLabel && `(${providerLabel} 기준)`}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Input
                        placeholder={
                          imagesEnabled
                            ? '이미지 검색 (예: ubuntu, amzn2, rhel)'
                            : '프로바이더 / 자격증명 / 리전 선택 후 검색 가능'
                        }
                        value={imageKeyword}
                        onChange={(e) => setImageKeyword(e.target.value)}
                        disabled={!imagesEnabled}
                      />
                      <div className={styles.selectContainer} style={{ width: '100%' }}>
                        <Select
                          options={imageOptions}
                          getOptionLabel={(o) => o.text}
                          getOptionValue={(o) => o.value}
                          value={selectedImage ?? null}
                          onChange={(opt: SelectSingleValue<OptionType>) =>
                            setOsImageId(opt?.value ?? '')
                          }
                          placeholder={imagePlaceholder}
                          isClearable
                          isDisabled={!imagesEnabled || isImagesPending}
                          isLoading={isImagesPending}
                          styles={{
                            control: (base) => ({ ...base, width: '100%', minHeight: '40px' }),
                            container: (base) => ({ ...base, width: '100%' }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: hasGpuNodes ? '#1a1a1a' : '#6b6b6b',
                      display: 'inline-flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <input type="checkbox" checked={hasGpuNodes} disabled readOnly />
                    GPU 노드 — {hasGpuNodes ? '자동 감지됨' : '없음'} (master/worker spec 의
                    gpuCount + instance type 기반)
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      display: 'inline-flex',
                      gap: 6,
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <input
                      id="enable-monitoring"
                      type="checkbox"
                      checked={enableMonitoring}
                      onChange={(e) => setEnableMonitoring(e.target.checked)}
                    />
                    <label htmlFor="enable-monitoring">
                      모니터링 설치 — Prometheus + Grafana. 끄면 모니터링 화면이 비어 있습니다.
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button
              size="large"
              color="secondary"
              onClick={() => navigate('/infra-management/vm')}
            >
              취소
            </Button>
            <Button size="large" color="primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? '요청 중...' : 'VM 프로비저닝 시작'}
            </Button>
          </div>
        </div>
      </div>
      <CredentialCreateModal
        isOpen={credentialModalOpen}
        defaultProvider={provider}
        onClose={() => setCredentialModalOpen(false)}
        onCreated={(cred) => {
          if (cred.id) onCredentialChange(cred.id);
        }}
      />
    </main>
  );
}