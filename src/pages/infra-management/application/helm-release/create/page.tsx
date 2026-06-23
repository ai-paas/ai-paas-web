import { useState, useMemo, useEffect, useCallback } from 'react';
import { BreadCrumb, Button, Input, Select, type SelectSingleValue, useToast } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import { configureMonacoYaml } from 'monaco-yaml';
import { useGetClusters } from '@/hooks/service/clusters';
import { useGetKubernetesNamespaces } from '@/hooks/service/clusters';
import { useGetHelmRepositories, useInstallHelmRelease } from '@/hooks/service/helm';
import { useGetCatalog } from '@/hooks/service/catalog';
import { useGetCatalogDetail } from '@/hooks/service/catalog';
import { useGetCatalogValues } from '@/hooks/service/catalog';
import styles from './page.module.scss';

type OptionType = { text: string; value: string };

type ValidationErrors = {
  cluster?: string;
  namespace?: string;
  releaseName?: string;
  repository?: string;
  catalogName?: string;
  version?: string;
  yaml?: string;
};

const breadcrumbItems = [
  { label: '인프라 모니터' },
  { label: '애플리케이션' },
  { label: '헬름 릴리즈' },
  { label: '헬름 릴리즈 생성' },
];

// Monaco Editor 설정
const MONACO_EDITOR_OPTIONS = {
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbers: 'on' as const,
  roundedSelection: false,
  scrollbar: {
    vertical: 'auto' as const,
    horizontal: 'auto' as const,
  },
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on' as const,
  formatOnPaste: true,
  formatOnType: true,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  smoothScrolling: true,
  renderWhitespace: 'selection' as const,
  bracketPairColorization: {
    enabled: true,
  },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

export default function HelmReleaseCreatePage() {
  const navigate = useNavigate();

  // 폼 상태
  const [cluster, setCluster] = useState<OptionType>();
  const [namespace, setNamespace] = useState<OptionType>();
  const [releaseName, setReleaseName] = useState<string>('');
  const [repository, setRepository] = useState<OptionType>();
  const [catalogName, setCatalogName] = useState<OptionType>();
  const [version, setVersion] = useState<OptionType>();
  const [yaml, setYaml] = useState<string>('');

  // Validation 에러 상태
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // API 호출
  const { clusters, isPending: isClustersPending } = useGetClusters();
  const { namespaces, isPending: isNamespacesPending } = useGetKubernetesNamespaces(
    cluster?.value,
    !!cluster?.value
  );
  const { repositories, isPending: isRepositoriesPending } = useGetHelmRepositories();
  const { charts, isPending: isChartsPending } = useGetCatalog(repository?.value || '');
  const { catalogDetail, isPending: isCatalogDetailPending } = useGetCatalogDetail(
    repository?.value || '',
    catalogName?.value || '',
    version?.value
  );
  const {
    data: valuesData,
    isPending: isValuesPending,
    isError: isValuesError,
    isSuccess: isValuesSuccess,
  } = useGetCatalogValues(repository?.value || '', catalogName?.value || '', version?.value);

  // 클러스터 옵션
  const clusterOptions = useMemo<OptionType[]>(() => {
    if (!clusters || clusters.length === 0) return [];
    return clusters.map((c) => ({
      text: c.description || c.id || '',
      value: c.id || '',
    }));
  }, [clusters]);

  // 네임스페이스 옵션
  const namespaceOptions = useMemo<OptionType[]>(() => {
    if (!namespaces || namespaces.length === 0) return [];
    return namespaces.map((ns) => ({
      text: ns.metadata.name,
      value: ns.metadata.name,
    }));
  }, [namespaces]);

  // 저장소 옵션
  const repositoryOptions = useMemo<OptionType[]>(() => {
    if (!repositories || repositories.length === 0) return [];
    return repositories.map((repo) => ({
      text: repo.name || '-',
      value: repo.name || '',
    }));
  }, [repositories]);

  // 카탈로그 이름 옵션
  const catalogNameOptions = useMemo<OptionType[]>(() => {
    if (!charts || charts.length === 0) return [];
    return charts.map((chart) => ({
      text: chart.name || '-',
      value: chart.name || '',
    }));
  }, [charts]);

  // 버전 옵션: versionHistory는 객체 배열로 고정 ({version, appVersion, created})
  const versionOptions = useMemo<OptionType[]>(() => {
    if (!catalogDetail?.versionHistory || !Array.isArray(catalogDetail.versionHistory)) {
      return [];
    }

    return catalogDetail.versionHistory
      .map((item) => item.version)
      .filter((version): version is string => Boolean(version))
      .map((version) => ({
        text: version,
        value: version,
      }));
  }, [catalogDetail]);

  // 클러스터 변경 시 네임스페이스 초기화
  useEffect(() => {
    setNamespace(undefined);
  }, [cluster]);

  // 버전 ↔ catalogDetail / YAML 동기화. 별도 effect 로 분리하면 동시 setState 가 두 번 trigger.
  useEffect(() => {
    const currentVersion = version?.value;

    if (!isCatalogDetailPending && version) {
      if (versionOptions.length > 0) {
        const isValidVersion = versionOptions.some((opt) => opt.value === version.value);
        if (!isValidVersion) {
          setVersion(undefined);
          setYaml('');
          return;
        }
      } else {
        // 카탈로그 이름 변경 등으로 옵션이 비면 버전 리셋
        setVersion(undefined);
        setYaml('');
        return;
      }
    }

    if (!currentVersion) {
      setYaml('');
      return;
    }

    if (isValuesPending) {
      return;
    }

    if (isValuesError) {
      setYaml(''); // 에러면 YAML 비움
      return;
    }

    // API 호출이 성공적으로 완료되고 데이터가 있으면 YAML 설정
    if (valuesData?.content !== undefined) {
      setYaml(valuesData.content);
    } else if (isValuesSuccess) {
      // 성공했지만 content가 없는 경우 빈 문자열
      setYaml('');
    }
  }, [
    version,
    versionOptions,
    isCatalogDetailPending,
    valuesData,
    isValuesPending,
    isValuesError,
    isValuesSuccess,
  ]);

  // 기본 클러스터 선택
  useEffect(() => {
    if (!cluster && clusterOptions.length > 0) {
      const latestCluster = [...clusterOptions].sort((a, b) => {
        const clusterA = clusters?.find((c) => c.id === a.value);
        const clusterB = clusters?.find((c) => c.id === b.value);
        const dateA = clusterA?.createdAt ? new Date(clusterA.createdAt).getTime() : 0;
        const dateB = clusterB?.createdAt ? new Date(clusterB.createdAt).getTime() : 0;
        return dateB - dateA;
      })[0];
      if (latestCluster) {
        setCluster(latestCluster);
      }
    }
  }, [clusterOptions, clusters, cluster]);

  // 기본 저장소 선택
  useEffect(() => {
    if (!repository && repositoryOptions.length > 0) {
      setRepository(repositoryOptions[0]);
    }
  }, [repositoryOptions, repository]);

  // Validation 에러 제거 헬퍼 함수
  const clearValidationError = useCallback((field: keyof ValidationErrors) => {
    setValidationErrors((prev) => {
      if (prev[field]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // 여러 필드의 Validation 에러 제거 헬퍼 함수
  const clearValidationErrors = useCallback((fields: Array<keyof ValidationErrors>) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      fields.forEach((field) => {
        delete newErrors[field];
      });
      return Object.keys(newErrors).length === 0 ? {} : newErrors;
    });
  }, []);

  // Select 컴포넌트 공통 스타일 생성 함수
  const getSelectStyles = useCallback(
    (hasError: boolean) => ({
      control: (base: Record<string, unknown>) => ({
        ...base,
        width: '100%',
        minHeight: '40px',
        borderColor: hasError ? '#ef4444' : (base.borderColor as string),
      }),
      container: (base: Record<string, unknown>) => ({
        ...base,
        width: '100%',
      }),
      menu: (base: Record<string, unknown>) => ({
        ...base,
        zIndex: 1000,
      }),
      menuPortal: (base: Record<string, unknown>) => ({
        ...base,
        zIndex: 1000,
      }),
    }),
    []
  );

  const handleClusterChange = useCallback(
    (option: SelectSingleValue<OptionType>) => {
      setCluster(option || undefined);
      clearValidationError('cluster');
    },
    [clearValidationError]
  );

  const handleNamespaceChange = useCallback(
    (option: SelectSingleValue<OptionType>) => {
      setNamespace(option || undefined);
      clearValidationError('namespace');
    },
    [clearValidationError]
  );

  const handleReleaseNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setReleaseName(value);
      if (value) {
        clearValidationError('releaseName');
      }
    },
    [clearValidationError]
  );

  const handleRepositoryChange = useCallback(
    (option: SelectSingleValue<OptionType>) => {
      setRepository(option || undefined);
      // 저장소 변경 시 카탈로그 이름, 버전 초기화
      setCatalogName(undefined);
      setVersion(undefined);
      setYaml('');
      clearValidationErrors(['repository', 'catalogName', 'version']);
    },
    [clearValidationErrors]
  );

  const handleCatalogNameChange = useCallback(
    (option: SelectSingleValue<OptionType>) => {
      setCatalogName(option || undefined);
      // 카탈로그 이름 변경 시 버전 초기화
      setVersion(undefined);
      setYaml('');
      clearValidationErrors(['catalogName', 'version']);
    },
    [clearValidationErrors]
  );

  const handleVersionChange = useCallback(
    (option: SelectSingleValue<OptionType>) => {
      // 버전 변경 시 YAML 초기화 (새로운 버전의 YAML을 로드하기 전까지)
      setYaml('');
      setVersion(option || undefined);
      clearValidationError('version');
    },
    [clearValidationError]
  );

  const handleYamlChange = useCallback(
    (value: string | undefined) => {
      const yamlValue = value || '';
      setYaml(yamlValue);
      if (yamlValue) {
        clearValidationError('yaml');
      }
    },
    [clearValidationError]
  );

  const handleCancel = useCallback(() => {
    navigate('/infra-management/application/helm-release');
  }, [navigate]);

  const { open } = useToast();
  const { installHelmRelease, isPending: isInstalling } = useInstallHelmRelease(cluster?.value, {
    onSuccess: () => {
      open({ title: '헬름 릴리즈 설치 요청이 접수되었습니다.' });
      navigate('/infra-management/application/helm-release');
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
      open({
        title: message || '헬름 릴리즈 설치 중 오류가 발생했습니다.',
        status: 'negative',
      });
    },
  });

  const handleCreate = useCallback(() => {
    // 필수 항목 체크
    const fieldValidations: Array<{
      field: keyof ValidationErrors;
      value: unknown;
      message: string;
    }> = [
      { field: 'cluster', value: cluster, message: '클러스터를 선택해주세요.' },
      { field: 'namespace', value: namespace, message: '네임스페이스를 선택해주세요.' },
      { field: 'releaseName', value: releaseName, message: '이름을 입력해주세요.' },
      { field: 'repository', value: repository, message: '저장소를 선택해주세요.' },
      { field: 'catalogName', value: catalogName, message: '카탈로그를 선택해주세요.' },
      { field: 'version', value: version, message: '버전을 선택해주세요.' },
      { field: 'yaml', value: yaml, message: '헬름 YAML을 입력해주세요.' },
    ];

    const newErrors: ValidationErrors = {};
    fieldValidations.forEach(({ field, value, message }) => {
      if (!value) {
        newErrors[field] = message;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    installHelmRelease({
      releaseName,
      chart: `${repository?.value}/${catalogName?.value}`,
      version: version?.value,
      namespace: namespace?.value,
      valuesYaml: yaml,
    });
  }, [cluster, namespace, releaseName, repository, catalogName, version, yaml, installHelmRelease]);

  const isYamlEnabled = !!version && !!valuesData?.content;

  // YAML 상태 메시지: 메시지가 있으면 placeholder 표시, 없으면 Editor 표시
  const yamlStatusMessage = useMemo(() => {
    if (!version) return '버전을 선택하면 YAML이 표시됩니다.';
    if (isValuesPending) return 'YAML을 불러오는 중입니다...';
    if (isValuesError) return 'YAML을 불러오지 못했습니다.';
    if (!valuesData?.content) return '표시할 YAML 데이터가 없습니다.';
    return null;
  }, [version, isValuesPending, isValuesError, valuesData?.content]);

  // Monaco Editor 마운트 전 YAML 언어 지원 설정
  const handleEditorBeforeMount: BeforeMount = useCallback((monaco) => {
    try {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: false,
        schemas: [],
        format: { enable: false },
        validate: false,
        completion: false,
        hover: false,
      });
    } catch (error) {
      console.warn('Monaco YAML configuration error:', error);
      // 에러가 발생해도 기본 YAML 지원은 작동함
    }
  }, []);

  // Monaco Editor 마운트 후 처리
  const handleEditorDidMount: OnMount = useCallback(() => {
    // 필요 시 editor 인스턴스 ref 저장 가능
  }, []);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">헬름 릴리즈 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클러스터</div>
            <div className="page-input_item-data">
              <div className={styles.selectContainer} style={{ width: '100%' }}>
                <Select
                  options={clusterOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={cluster ?? null}
                  onChange={handleClusterChange}
                  placeholder="클러스터를 선택하세요"
                  isLoading={isClustersPending}
                  styles={getSelectStyles(!!validationErrors.cluster)}
                />
              </div>
              {validationErrors.cluster && (
                <p className="page-input_item-input-error">{validationErrors.cluster}</p>
              )}
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">네임스페이스</div>
            <div className="page-input_item-data">
              <div className={styles.selectContainer} style={{ width: '100%' }}>
                <Select
                  options={namespaceOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={namespace ?? null}
                  onChange={handleNamespaceChange}
                  placeholder="네임스페이스를 선택하세요"
                  isLoading={isNamespacesPending}
                  isDisabled={!cluster}
                  styles={getSelectStyles(!!validationErrors.namespace)}
                />
              </div>
              {validationErrors.namespace && (
                <p className="page-input_item-input-error">{validationErrors.namespace}</p>
              )}
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input
                value={releaseName}
                onChange={handleReleaseNameChange}
                placeholder="이름을 입력하세요"
                variant={validationErrors.releaseName ? 'err' : 'default'}
              />
              {validationErrors.releaseName && (
                <p className="page-input_item-input-error">{validationErrors.releaseName}</p>
              )}
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">카탈로그</div>
            <div className="page-input_item-data">
              <div className={styles.catalogSelects}>
                <div className={styles.selectWrapper} style={{ width: '100%' }}>
                  <div className={styles.selectLabel}>저장소</div>
                  <div className={styles.selectContainer}>
                    <Select
                      options={repositoryOptions}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={repository ?? null}
                      onChange={handleRepositoryChange}
                      placeholder="저장소"
                      isLoading={isRepositoriesPending}
                      styles={getSelectStyles(!!validationErrors.repository)}
                    />
                  </div>
                </div>
                <div className={styles.selectWrapper} style={{ width: '100%' }}>
                  <div className={styles.selectLabel}>카탈로그 이름</div>
                  <div className={styles.selectContainer}>
                    <Select
                      key={repository?.value || 'catalog-name-select'}
                      options={catalogNameOptions}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={catalogName ?? null}
                      onChange={handleCatalogNameChange}
                      placeholder="카탈로그 이름"
                      isLoading={isChartsPending}
                      isDisabled={!repository}
                      styles={getSelectStyles(!!validationErrors.catalogName)}
                    />
                  </div>
                </div>
                <div className={styles.selectWrapper} style={{ width: '100%' }}>
                  <div className={styles.selectLabel}>버전</div>
                  <div className={styles.selectContainer}>
                    <Select
                      key={catalogName?.value || 'version-select'}
                      options={versionOptions}
                      getOptionLabel={(option) => option.text}
                      getOptionValue={(option) => option.value}
                      value={version ?? null}
                      onChange={handleVersionChange}
                      placeholder="버전"
                      isDisabled={!catalogName}
                      styles={getSelectStyles(!!validationErrors.version)}
                    />
                  </div>
                </div>
              </div>
              {(validationErrors.repository ||
                validationErrors.catalogName ||
                validationErrors.version) && (
                <p className="page-input_item-input-error">
                  {validationErrors.repository ||
                    validationErrors.catalogName ||
                    validationErrors.version}
                </p>
              )}
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">헬름 YAML</div>
            <div className="page-input_item-data">
              {yamlStatusMessage ? (
                <div className={styles.yamlPlaceholder}>{yamlStatusMessage}</div>
              ) : (
                <div
                  className={`${styles.monacoEditorContainer} ${
                    validationErrors.yaml ? styles.error : ''
                  }`}
                >
                  <Editor
                    key={version?.value ?? 'yaml-editor'}
                    height="400px"
                    language="yaml"
                    value={yaml}
                    onChange={handleYamlChange}
                    beforeMount={handleEditorBeforeMount}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      ...MONACO_EDITOR_OPTIONS,
                      readOnly: !isYamlEnabled,
                    }}
                  />
                </div>
              )}
              {validationErrors.yaml && (
                <p className="page-input_item-input-error">{validationErrors.yaml}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={handleCancel}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={handleCreate} disabled={isInstalling}>
              {isInstalling ? '생성 중...' : '생성'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
