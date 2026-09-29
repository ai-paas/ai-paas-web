import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { BreadCrumb, Button, Input, Select, type SelectSingleValue, useToast } from '@innogrid/ui';
import { useCreateVm, usePreflightVm } from '@/hooks/service/vms';
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
import { useGetProviderConfigSchema, useGetProviders } from '@/hooks/service/providers';
import { SpecPicker } from '@/components/features/infra-management/provisioning/spec-picker';
import {
  AddonPicker,
  type AddonSelection,
} from '@/components/features/infra-management/provisioning/addon-picker';
import { ProxmoxSpecInput } from '@/components/features/infra-management/provisioning/proxmox-spec-input';
import { NodeComposition } from '@/components/features/infra-management/provisioning/node-composition';
import { isGpuSpec } from '@/util/gpuInstance';
import { PREFERRED_OS, preferredImage } from '@/util/preferred-image';
import { errorDetail, errorHint, errorMessage } from '@/util/api-error';
import styles from '../../cluster-management/create/page.module.scss';

type OptionType = { text: string; value: string };

const environmentOptions: OptionType[] = [
  { text: 'dev', value: 'dev' },
  { text: 'stage', value: 'stage' },
  { text: 'prod', value: 'prod' },
];

type ValidationErrors = {
  vmGroupName?: string;
  provider?: string;
  region?: string;
  osImage?: string;
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
  // 기본 리전은 백엔드가 CSP 마다 알려준다. 화면에 목록을 두면 CSP 가 늘 때 한쪽만 고쳐진다.
  /*
   * Proxmox 는 하이퍼바이저다. 리전이 없고, 인스턴스 타입 목록도 없어 "코어-메모리MiB" 를 직접
   * 받는다. 조회로 채우는 칸을 그대로 두면 영영 비어 있어 폼을 제출할 수 없다.
   */
  const isProxmox = provider.toUpperCase() === 'PROXMOX';

  const { providers: providerCatalog } = useGetProviders();
  const defaultRegionId = providerCatalog.find(
    (p) => p.provider?.toLowerCase() === provider?.toLowerCase()
  )?.recommendedRegion;
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
  const [addons, setAddons] = useState<AddonSelection>({
    monitoring: true,
    gpuOperator: false,
    ingress: false,
  });
  /** 서버가 돌려준 차단 사유. 화면이 알 수 없는 것(용량, 자격증명 만료)이 여기로 온다. */
  const [preflightErrors, setPreflightErrors] = useState<string[]>([]);
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
  /*
   * IBM, OCI, Alibaba 는 이미지를 반드시 받아야 한다 — 이름으로 찾는 안정된 필터가 없어
   * emitter 가 값을 그대로 넘긴다. 고급 옵션 안에 접어 두면 비운 채로 만들기를 눌러
   * 프로비저닝 중반에야 거절당한다.
   */
  const osImageRequired = configSchemaFields.some(
    (f) => f.key === 'anycloud-k8s:osImage' && f.required
  );
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
              : `이미지 선택 (기본 ${PREFERRED_OS})`;

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

  const { preflightVm, isPreflighting } = usePreflightVm();
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
    // Proxmox 는 리전이 없다. 배치할 PVE 노드를 providerSpec.nodeName 으로 받는다.
    if (!region && !isProxmox) next.region = '리전을 선택해주세요.';
    if (!masterSpecId) next.masterSpec = isProxmox
      ? 'master 사양을 "코어-메모리MiB" 형식으로 입력해주세요.'
      : 'master 인스턴스 타입을 선택해주세요.';
    if (!workerSpecId) next.workerSpec = isProxmox
      ? 'worker 사양을 "코어-메모리MiB" 형식으로 입력해주세요.'
      : 'worker 인스턴스 타입을 선택해주세요.';
    // CSP 고유 값은 서버가 preflight 에서 거절한다. 여기서 막아야 생성 버튼을 누르기 전에 안다.
    if (osImageRequired && !osImageId) next.osImage = 'OS 이미지를 선택해주세요.';
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
  /*
   * 목록이 오면 검증한 기본 이미지를 골라 둔다. 비워 두면 CSP 마다 다른 기본값이 쓰여 어떤
   * 버전으로 떴는지 나중에 알 수 없다. 사용자가 고른 뒤에는 건드리지 않는다.
   */
  const imageAutoApplied = useRef(false);
  useEffect(() => {
    if (osImageId || imageOptions.length === 0 || imageAutoApplied.current) return;
    const preferred = preferredImage(imageOptions);
    if (!preferred) return;
    imageAutoApplied.current = true;
    setOsImageId(preferred.value);
  }, [imageOptions, osImageId]);

  /*
   * GPU 를 고르면 드라이버 스택도 켠다. 없는데 켜져 있으면 다시 끈다 — 다른 인스턴스로 바꾼
   * 뒤에도 남아 있으면 쓰지도 않을 것이 올라간다.
   *
   * 사용자가 직접 끈 뒤에는 되돌리지 않는다. 매번 되살리면 끌 수가 없다.
   */
  /*
   * GPU 만 보기를 켜면 아직 고르지 않았어도 GPU 로 만들 뜻으로 본다. 고르고 나서 애드온을
   * 다시 찾아 켤 일이 없다.
   */
  const [gpuFilterOn, setGpuFilterOn] = useState(false);
  const gpuIntent = hasGpuNodes || gpuFilterOn;
  const gpuOperatorTouched = useRef(false);
  useEffect(() => {
    if (gpuOperatorTouched.current) return;
    setAddons((prev) => (prev.gpuOperator === gpuIntent ? prev : { ...prev, gpuOperator: gpuIntent }));
  }, [gpuIntent]);

  /* 고급 옵션과 본문 어느 쪽에도 같은 UI 를 놓는다. 두 벌로 두면 한쪽만 고쳐진다. */
  const osImagePicker = (
    <>
      {isProxmox ? (
                        /*
                         * Proxmox 는 이미지 카탈로그가 없다. PVE 가 URL 에서 내려받으므로 주소를
                         * 그대로 받는다. 비우면 Ubuntu 24.04 cloud 이미지를 쓴다.
                         */
                        <Input
                          placeholder="이미지 URL — 비우면 Ubuntu 24.04 cloud 이미지"
                          value={osImageId}
                          onChange={(e) => setOsImageId(e.target.value.trim())}
                          aria-label="Proxmox 이미지 URL"
                        />
                      ) : (
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
                      )}
    </>
  );

  const handleSubmit = async () => {
    if (!validate()) return;

    const spec: ClusterSpecRequest = {
      masterCount,
      workerCount,
      masterInstanceType: masterSpecId,
      workerInstanceType: workerSpecId,
    };
    if (osImageId) spec.osImage = osImageId;
    // 켜는 것이 기본이라 끌 때만 보낸다. 기본값 판단은 백엔드 한 곳에 둔다.
    if (!addons.monitoring) spec.enableMonitoring = false;
    if (addons.ingress) spec.enableIngress = true;
    /*
     * GPU 는 백엔드도 스펙으로 판정해 자동으로 켠다. 끈 것만 명시해 보낸다 — 켜는 쪽을 화면이
     * 보내면 UI 를 우회했을 때 판정이 갈린다.
     */
    if (hasGpuNodes && !addons.gpuOperator) spec.enableGpuOperator = false;
    else if (!hasGpuNodes && addons.gpuOperator) spec.enableGpuOperator = true;

    const request = {
      vmGroupName,
      provider: provider.toLowerCase(),
      // 백엔드는 region 을 저장 키로 쓴다. Proxmox 에는 리전이 없어 배치 노드 이름을 넣는다.
      region: isProxmox ? (providerSpec.nodeName ?? '') : region,
      environment: environment.value || undefined,
      credentialId,
      description: description || undefined,
      spec,
      providerSpec: Object.keys(providerSpec).length > 0 ? providerSpec : undefined,
      hasGpuNodes,
    };

    /*
     * 만들기 전에 서버에 물어본다. 화면은 CSP 에 지금 자리가 있는지, 자격증명이 아직 통하는지
     * 알 수 없다 — 그냥 보내면 인프라를 절반 만든 뒤 롤백한다.
     */
    setPreflightErrors([]);
    try {
      const result = await preflightVm(request);
      if (result?.readyToProvision === false) {
        setPreflightErrors(result.errors?.length ? result.errors : ['생성할 수 없는 설정입니다.']);
        return;
      }
    } catch {
      // 검증 자체가 실패하면 막지 않는다. 검증이 안 된다고 생성을 못 하게 할 이유는 없다.
      setPreflightErrors([]);
    }
    createVm(request);
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

          {/* 5. 리전 — Proxmox 는 하이퍼바이저라 리전이 없다 */}
          {!isProxmox && (
            <div className="page-input_item-box">
              <div className="page-input_item-name page-icon-requisite">리전</div>
              <div className="page-input_item-data">
                <RegionSelect
                  provider={provider}
                  credentialId={credentialId || undefined}
                  value={region}
                  onChange={onRegionChange}
                  defaultRegionId={defaultRegionId}
                  errorText={errors.region}
                />
              </div>
            </div>
          )}

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
              {isProxmox ? (
                <ProxmoxSpecInput
                  value={masterSpecId}
                  onChange={(v) => {
                    setMasterSpecId(v);
                    setErrors((p) => ({ ...p, masterSpec: undefined }));
                  }}
                  errorText={errors.masterSpec}
                />
              ) : (
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
              )}
            </div>
          </div>

          {/* GPU 는 고른 인스턴스에서 나온다. 원인 옆에 결과를 둔다 — 고급 옵션에 두면 왜 켜졌는지 모른다. */}
          {gpuIntent && (
            <div className="page-input_item-box">
              <div className="page-input_item-name" />
              <div className="page-input_item-data">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#15803d',
                    fontSize: 12,
                  }}
                >
                  {hasGpuNodes
                    ? 'GPU 노드 — 드라이버 스택(GPU Operator)이 함께 설치됩니다'
                    : 'GPU 인스턴스를 고르면 드라이버 스택이 함께 설치됩니다'}
                </span>
              </div>
            </div>
          )}

          {/* 9. Worker 인스턴스 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">Worker 인스턴스</div>
            <div className="page-input_item-data">
              {isProxmox ? (
                <ProxmoxSpecInput
                  value={workerSpecId}
                  onChange={(v) => {
                    setWorkerSpecId(v);
                    setErrors((p) => ({ ...p, workerSpec: undefined }));
                  }}
                  errorText={errors.workerSpec}
                />
              ) : (
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
                  onGpuOnlyChange={setGpuFilterOn}
                  errorText={errors.workerSpec}
                />
              )}
            </div>
          </div>

          {/* 9-1. OS 이미지 — 스키마가 필수라고 한 CSP 만 본문에 둔다 */}
          {osImageRequired && (
            <div className="page-input_item-box">
              <div className="page-input_item-name page-icon-requisite">OS 이미지</div>
              <div className="page-input_item-data">
                {osImagePicker}
                {errors.osImage && (
                  <p className="page-input_item-input-error">{errors.osImage}</p>
                )}
              </div>
            </div>
          )}

          {/* 10. OS 이미지 — 필수가 아닌 CSP 는 비워 두면 기본값을 쓴다 */}
          {!osImageRequired && (
            <div className="page-input_item-box">
              <div className="page-input_item-name">
                OS 이미지 {providerLabel && `(${providerLabel} 기준)`}
              </div>
              <div className="page-input_item-data">{osImagePicker}</div>
            </div>
          )}

          {/* 11. 애드온 — 클러스터에 함께 올릴 것들 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">애드온</div>
            <div className="page-input_item-data">
              <AddonPicker
                value={addons}
                onChange={(next) => {
                  if (next.gpuOperator !== addons.gpuOperator) gpuOperatorTouched.current = true;
                  setAddons(next);
                }}
                hasGpuNodes={gpuIntent}
              />
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
            {preflightErrors.length > 0 && (
              <div
                role="alert"
                style={{
                  width: '100%',
                  marginBottom: 12,
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>이 설정으로는 만들 수 없습니다</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {preflightErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              size="large"
              color="primary"
              onClick={handleSubmit}
              disabled={isPending || isPreflighting}
            >
              {isPreflighting ? '설정 확인 중...' : isPending ? '요청 중...' : 'VM 프로비저닝 시작'}
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