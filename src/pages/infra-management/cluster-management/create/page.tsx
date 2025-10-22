import { useState, useCallback } from 'react';
import {
  BreadCrumb,
  Button,
  Input,
  Textarea,
  Select,
  type SelectSingleValue,
  useToast,
} from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { useCreateCluster } from '@/hooks/service/clusters';
import styles from './page.module.scss';

type OptionType = { text: string; value: string };

const publicCloudProviders = [
  { text: 'AWS', value: 'aws' },
  { text: 'Google', value: 'google' },
  { text: 'Azure', value: 'azure' },
  { text: 'NCP', value: 'ncp' },
];

const privateCloudProviders = [
  { text: 'VMware', value: 'vmware' },
  { text: 'OpenStack', value: 'openstack' },
];

export default function ClusterCreatePage() {
  const navigate = useNavigate();
  const { open } = useToast();

  // 콜백 함수들을 useCallback으로 메모이제이션
  const handleSuccess = useCallback(() => {
    open({
      title: '클러스터가 성공적으로 생성되었습니다.',
    });
    navigate('/infra-management/cluster-management');
  }, [open, navigate]);

  const handleError = useCallback((error: unknown) => {
    let errorMessage = '클러스터 생성 중 오류가 발생했습니다. 다시 시도해주세요.';

    // HTTP 에러인 경우
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as { response?: { status?: number; data?: unknown } };

      // 서버 메시지 추출
      let serverMessage = '';
      const responseData = httpError.response?.data;
      if (typeof responseData === 'string') {
        serverMessage = responseData;
      } else if (typeof responseData === 'object' && responseData) {
        const obj = responseData as {
          message?: string;
          error?: string;
          detail?: string;
          msg?: string;
        };
        serverMessage = obj.message || obj.error || obj.detail || obj.msg || '';
      }

      if (serverMessage) {
        // 중복 에러인지 확인하여 적절한 메시지 설정
        const isDuplicate =
          serverMessage.includes('중복') ||
          serverMessage.includes('duplicate') ||
          serverMessage.includes('already exists');

        errorMessage = isDuplicate
          ? '클러스터 이름이 중복되었습니다. 다른 이름을 사용해주세요.'
          : serverMessage;
      }
    } else {
      // 일반 에러인 경우
      const errorObj = error as { message?: string; error?: string };
      errorMessage = errorObj?.message || errorObj?.error || errorMessage;
    }

    // 클러스터 이름 필드에 에러 표시
    setValidationErrors((prev) => ({
      ...prev,
      clusterName: errorMessage,
    }));
  }, []);

  const [clusterName, setClusterName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [apiServerIp, setApiServerIp] = useState<string>('');
  const [apiServerUrl, setApiServerUrl] = useState<string>('');
  const [serverCA, setServerCA] = useState<string>('');
  const [clientCA, setClientCA] = useState<string>('');
  const [clientKey, setClientKey] = useState<string>('');
  const [clientToken, setClientToken] = useState<string>('');
  const [monitServerURL, setMonitServerURL] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<OptionType>();
  const [clusterType, setClusterType] = useState<string>('public');

  // Validation 에러 상태
  const [validationErrors, setValidationErrors] = useState<{
    clusterName?: string;
    clusterProvider?: string;
    description?: string;
    apiServerUrl?: string;
    apiServerIp?: string;
    serverCA?: string;
    clientCA?: string;
    clientKey?: string;
    monitServerURL?: string;
  }>({});

  const { createCluster, isPending: isCreating } = useCreateCluster({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const onClusterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClusterName(value);

    // 클러스터 이름 중복 에러가 있다면 제거
    if (validationErrors.clusterName) {
      setValidationErrors((prev) => ({
        ...prev,
        clusterName: undefined,
      }));
    }
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);

    // 실시간 validation
    const error = validateDescription(value);
    setValidationErrors((prev) => ({
      ...prev,
      description: error || undefined,
    }));
  };

  const onApiServerIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiServerIp(value);

    // 실시간 validation
    const error = validateApiServerIp(value);
    setValidationErrors((prev) => ({
      ...prev,
      apiServerIp: error || undefined,
    }));
  };

  const onApiServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiServerUrl(value);

    // 실시간 validation
    const error = validateApiServerUrl(value);
    setValidationErrors((prev) => ({
      ...prev,
      apiServerUrl: error || undefined,
    }));
  };

  const onServerCAChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setServerCA(value);

    // 실시간 validation
    if (validationErrors.serverCA && value) {
      setValidationErrors((prev) => ({
        ...prev,
        serverCA: undefined,
      }));
    }
  };

  const onClientCAChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setClientCA(value);

    // 실시간 validation
    if (validationErrors.clientCA && value) {
      setValidationErrors((prev) => ({
        ...prev,
        clientCA: undefined,
      }));
    }
  };

  const onClientKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setClientKey(value);

    // 실시간 validation
    if (validationErrors.clientKey && value) {
      setValidationErrors((prev) => ({
        ...prev,
        clientKey: undefined,
      }));
    }
  };

  const onClientTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientToken(e.target.value);
  };

  const onMonitServerURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMonitServerURL(value);

    // 실시간 validation
    const error = validateMonitServerUrl(value);
    setValidationErrors((prev) => ({
      ...prev,
      monitServerURL: error || undefined,
    }));

    // 필수 필드 validation
    if (validationErrors.monitServerURL && value) {
      setValidationErrors((prev) => ({
        ...prev,
        monitServerURL: undefined,
      }));
    }
  };

  const onProviderChange = (option: SelectSingleValue<OptionType>) => {
    setSelectedProvider(option || undefined);

    // 클러스터 프로바이더 에러가 있다면 제거
    if (validationErrors.clusterProvider) {
      setValidationErrors((prev) => ({
        ...prev,
        clusterProvider: undefined,
      }));
    }
  };

  const onClusterTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClusterType(e.target.value);
    // 클러스터 유형이 변경되면 선택된 프로바이더 초기화
    setSelectedProvider(undefined);
  };

  // 클러스터 유형에 따른 프로바이더 옵션
  const providerOptions = clusterType === 'public' ? publicCloudProviders : privateCloudProviders;

  // Validation 함수들
  const validateDescription = (desc: string): string | null => {
    if (desc && desc.length > 500) {
      return '설명은 500자를 초과할 수 없습니다';
    }
    return null;
  };

  const validateApiServerUrl = (url: string): string | null => {
    if (url && !/^https?:\/\/.*/.test(url)) {
      return '올바른 URL 형식이어야 합니다 (http:// 또는 https://로 시작)';
    }
    return null;
  };

  const validateApiServerIp = (ip: string): string | null => {
    if (ip && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
      return '올바른 IP 주소 형식이어야 합니다 (예: 192.168.1.1)';
    }
    return null;
  };

  const validateMonitServerUrl = (url: string): string | null => {
    if (url && !/^https?:\/\/.*/.test(url)) {
      return '올바른 URL 형식이어야 합니다 (http:// 또는 https://로 시작)';
    }
    return null;
  };

  // 클러스터 생성 핸들러
  const handleCreateCluster = () => {
    // 필수 항목 체크 (Token과 설명은 제외)
    if (
      !clusterName ||
      !selectedProvider ||
      !apiServerIp ||
      !apiServerUrl ||
      !serverCA ||
      !clientCA ||
      !clientKey ||
      !monitServerURL
    ) {
      // 필수 항목이 비어있으면 해당 필드에 에러 표시
      const newErrors: typeof validationErrors = {};
      if (!clusterName) newErrors.clusterName = '클러스터 이름을 입력해주세요.';
      if (!selectedProvider) newErrors.clusterProvider = '클러스터 프로바이더를 선택해주세요.';
      if (!apiServerIp) newErrors.apiServerIp = 'API 서버 IP를 입력해주세요.';
      if (!apiServerUrl) newErrors.apiServerUrl = 'API 서버 URL을 입력해주세요.';
      if (!serverCA) newErrors.serverCA = '서버 CA를 입력해주세요.';
      if (!clientCA) newErrors.clientCA = '클라이언트 CA를 입력해주세요.';
      if (!clientKey) newErrors.clientKey = '클라이언트 KEY를 입력해주세요.';
      if (!monitServerURL) newErrors.monitServerURL = '모니터링 API URL을 입력해주세요.';

      setValidationErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // 클러스터 생성 API 호출
    const clusterTypeValue = clusterType === 'public' ? 'Public' : 'Private';
    const providerValue = selectedProvider.text;

    createCluster({
      clusterType: clusterTypeValue,
      clusterProvider: providerValue,
      clusterName,
      description,
      apiServerIp,
      apiServerUrl,
      serverCA,
      clientCA,
      clientKey,
      clientToken,
      monitServerURL: monitServerURL,
    });
  };

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '인프라 관리' },
          { label: '클러스터 관리', path: '/infra-management/cluster-management' },
          { label: '클러스터 생성' },
        ]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
      <div className="page-title-box">
        <h2 className="page-title">클러스터 생성</h2>
      </div>
      <div className="page-content page-pb-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">유형</div>
            <div className="page-input_item-data">
              <div className={styles.radioGroup}>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="clusterType"
                    value="public"
                    checked={clusterType === 'public'}
                    onChange={onClusterTypeChange}
                  />
                  <span className={styles.radioLabel}>퍼블릭 클라우드</span>
                </label>
                <label className={styles.radioItem}>
                  <input
                    type="radio"
                    name="clusterType"
                    value="private"
                    checked={clusterType === 'private'}
                    onChange={onClusterTypeChange}
                  />
                  <span className={styles.radioLabel}>프라이빗 클라우드</span>
                </label>
              </div>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클러스터 프로바이더</div>
            <div className="page-input_item-data">
              <div className={styles.selectContainer} style={{ width: '100%' }}>
                <Select
                  key={`${clusterType}-${selectedProvider?.value || 'none'}`}
                  options={providerOptions}
                  getOptionLabel={(option) => option.text}
                  getOptionValue={(option) => option.value}
                  value={selectedProvider}
                  onChange={onProviderChange}
                  placeholder="클러스터 프로바이더를 선택해주세요."
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: '100%',
                      minHeight: '40px',
                    }),
                    container: (base) => ({
                      ...base,
                      width: '100%',
                    }),
                  }}
                />
              </div>
              {validationErrors.clusterProvider && (
                <p className="page-input_item-input-error">{validationErrors.clusterProvider}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클러스터 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="클러스터명을 입력해주세요."
                value={clusterName}
                onChange={onClusterNameChange}
                variant={validationErrors.clusterName ? 'err' : 'default'}
              />
              {validationErrors.clusterName && (
                <p className="page-input_item-input-error">{validationErrors.clusterName}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">API 서버 IP</div>
            <div className="page-input_item-data">
              <Input
                placeholder="127.0.0.1"
                value={apiServerIp}
                onChange={onApiServerIpChange}
                variant={validationErrors.apiServerIp ? 'err' : 'default'}
              />
              {validationErrors.apiServerIp && (
                <p className="page-input_item-input-error">{validationErrors.apiServerIp}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">API 서버 URL</div>
            <div className="page-input_item-data">
              <Input
                placeholder="https://127.0.0.1:6443"
                value={apiServerUrl}
                onChange={onApiServerUrlChange}
                variant={validationErrors.apiServerUrl ? 'err' : 'default'}
              />
              {validationErrors.apiServerUrl && (
                <p className="page-input_item-input-error">{validationErrors.apiServerUrl}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">서버 CA</div>
            <div className="page-input_item-data">
              <Textarea
                value={serverCA}
                onChange={onServerCAChange}
                placeholder="서버 CA 인증서를 입력해주세요."
                className={validationErrors.serverCA ? 'error' : ''}
              />
              {validationErrors.serverCA && (
                <p className="page-input_item-input-error">{validationErrors.serverCA}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클라이언트 CA</div>
            <div className="page-input_item-data">
              <Textarea
                value={clientCA}
                onChange={onClientCAChange}
                placeholder="클라이언트 CA 인증서를 입력해주세요."
                className={validationErrors.clientCA ? 'error' : ''}
              />
              {validationErrors.clientCA && (
                <p className="page-input_item-input-error">{validationErrors.clientCA}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클라이언트 KEY</div>
            <div className="page-input_item-data">
              <Textarea
                className={`${styles.kubernetesTextarea} ${validationErrors.clientKey ? 'error' : ''}`}
                value={clientKey}
                onChange={onClientKeyChange}
                placeholder="클라이언트 KEY 를 입력해주세요."
              />
              {validationErrors.clientKey && (
                <p className="page-input_item-input-error">{validationErrors.clientKey}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">클라이언트 Token</div>
            <div className="page-input_item-data">
              <Input
                placeholder="클라이언트 Token을 입력해주세요."
                value={clientToken}
                onChange={onClientTokenChange}
              />
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모니터링 API URL</div>
            <div className="page-input_item-data">
              <Input
                placeholder="모니터링 API URL 을 입력해주세요."
                value={monitServerURL}
                onChange={onMonitServerURLChange}
                variant={validationErrors.monitServerURL ? 'err' : 'default'}
              />
              {validationErrors.monitServerURL && (
                <p className="page-input_item-input-error">{validationErrors.monitServerURL}</p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Input
                placeholder="클러스터에 대한 설명을 입력해주세요."
                value={description}
                onChange={onDescriptionChange}
                variant={validationErrors.description ? 'err' : 'default'}
              />
              {validationErrors.description && (
                <p className="page-input_item-input-error">{validationErrors.description}</p>
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
              onClick={() => navigate('/infra-management/cluster-management')}
            >
              취소
            </Button>
            <Button
              size="large"
              color="primary"
              onClick={handleCreateCluster}
              disabled={isCreating}
            >
              {isCreating ? '생성' : '생성'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
