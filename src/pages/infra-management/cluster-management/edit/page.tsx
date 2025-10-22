import { useState, useCallback, useEffect } from 'react';
import {
  BreadCrumb,
  Button,
  Input,
  Textarea,
  Select,
  type SelectSingleValue,
  useToast,
} from '@innogrid/ui';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useUpdateCluster, useGetCluster } from '@/hooks/service/clusters';
import styles from '../create/page.module.scss';

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

export default function ClusterEditPage() {
  const navigate = useNavigate();
  const { open } = useToast();
  const { clusterId } = useParams<{ clusterId: string }>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  // 기존 클러스터 데이터 조회
  const { cluster } = useGetCluster(clusterId);

  // 콜백 함수들을 useCallback으로 메모이제이션
  const handleSuccess = useCallback(() => {
    open({
      title: '클러스터가 성공적으로 수정되었습니다.',
    });
    // returnTo가 있으면 해당 경로로, 없으면 클러스터 목록으로 이동
    const targetPath = returnTo || '/infra-management/cluster-management';
    navigate(targetPath);
  }, [open, navigate, returnTo]);

  const handleError = useCallback(
    (error: unknown) => {
      let errorMessage = '클러스터 수정 중 오류가 발생했습니다. 다시 시도해주세요.';

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
          errorMessage = serverMessage;
        }
      } else {
        // 일반 에러인 경우
        const errorObj = error as { message?: string; error?: string };
        errorMessage = errorObj?.message || errorObj?.error || errorMessage;
      }

      // 에러 메시지를 토스트로 표시
      open({
        title: errorMessage,
        status: 'negative',
      });
    },
    [open]
  );

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

  const { updateCluster, isPending: isUpdating } = useUpdateCluster({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // 클러스터 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (cluster) {
      setClusterName(cluster.id || '');
      setDescription(cluster.description || '');
      setApiServerIp(cluster.apiServerIp || '');
      setApiServerUrl(cluster.apiServerUrl || '');
      setServerCA(cluster.serverCa || '');
      setClientCA(cluster.clientCa || '');
      setClientKey(cluster.clientKey || '');
      setClientToken(cluster.clientToken || '');
      setMonitServerURL(cluster.monitServerUrl || '');

      // 클러스터 타입과 프로바이더는 기본값으로 설정
      // 실제 API에서 이 정보를 제공하지 않으므로 기본값 사용
      setClusterType('public');
      setSelectedProvider(publicCloudProviders[0]); // AWS를 기본값으로 설정
    }
  }, [cluster]);

  // 클러스터 이름은 수정할 수 없으므로 핸들러 제거

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
    setServerCA(e.target.value);
  };

  const onClientCAChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClientCA(e.target.value);
  };

  const onClientKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClientKey(e.target.value);
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

  // 클러스터 수정 핸들러
  const handleUpdateCluster = () => {
    if (!clusterId) {
      open({
        title: '클러스터 ID가 없습니다.',
        variant: 'error',
      });
      return;
    }

    // 필수 항목 체크 (Token과 설명 제외)
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

    // 클러스터 수정 API 호출
    const clusterTypeValue = clusterType === 'public' ? 'Public' : 'Private';
    const providerValue = selectedProvider.text;

    const updateData = {
      clusterId,
      clusterType: clusterTypeValue,
      clusterProvider: providerValue,
      clusterName,
      description: description || '',
      apiServerIp,
      apiServerUrl,
      serverCA,
      clientCA,
      clientKey,
      clientToken: clientToken || '',
      monitServerURL: monitServerURL || '',
    };

    updateCluster(updateData);
  };

  return (
    <main>
      <BreadCrumb
        items={[
          { label: '인프라 관리' },
          { label: '클러스터 관리', path: '/infra-management/cluster-management' },
          { label: '클러스터 편집' },
        ]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
      <div className="page-title-box">
        <h2 className="page-title">클러스터 편집</h2>
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
              <p className="page-input_item-input-desc">클러스터의 배포 환경을 선택해주세요.</p>
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
              <p className="page-input_item-input-desc">
                클러스터를 호스팅할 클라우드 프로바이더를 선택해주세요.
              </p>
              {validationErrors.clusterProvider && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.clusterProvider}
                </p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클러스터 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="클러스터명을 입력해주세요."
                value={clusterName}
                variant={validationErrors.clusterName ? 'err' : 'default'}
                disabled={true}
              />
              <p className="page-input_item-input-desc">
                클러스터 이름은 고유한 값으로 수정할 수 없습니다.
              </p>
              {validationErrors.clusterName && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.clusterName}
                </p>
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
              <p className="page-input_item-input-desc">
                쿠버네티스 API 서버의 IP 주소를 입력해주세요. (예: 192.168.1.1)
              </p>
              {validationErrors.apiServerIp && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.apiServerIp}
                </p>
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
              <p className="page-input_item-input-desc">
                쿠버네티스 API 서버의 URL을 입력해주세요. (http:// 또는 https://로 시작)
              </p>
              {validationErrors.apiServerUrl && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.apiServerUrl}
                </p>
              )}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">서버 CA</div>
            <div className="page-input_item-data">
              <Textarea
                className={validationErrors.serverCA ? 'error' : ''}
                value={serverCA}
                onChange={onServerCAChange}
                placeholder="서버 CA 인증서를 입력해주세요."
              />
              <p className="page-input_item-input-desc">
                쿠버네티스 서버 CA 인증서를 입력해주세요.
              </p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클라이언트 CA</div>
            <div className="page-input_item-data">
              <Textarea
                className={validationErrors.clientCA ? 'error' : ''}
                value={clientCA}
                onChange={onClientCAChange}
                placeholder="클라이언트 CA 인증서를 입력해주세요."
              />
              <p className="page-input_item-input-desc">클라이언트 CA 인증서를 입력해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">클라이언트 KEY</div>
            <div className="page-input_item-data">
              <Textarea
                className={`${styles.kubernetesTextarea} ${validationErrors.clientKey ? 'error' : ''}`}
                value={clientKey}
                onChange={onClientKeyChange}
                placeholder="클라이언트 키를 입력해주세요."
              />
              <p className="page-input_item-input-desc">클라이언트 키를 입력해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name">클라이언트 Token</div>
            <div className="page-input_item-data">
              <Input
                placeholder="클라이언트 토큰을 입력해주세요."
                value={clientToken}
                onChange={onClientTokenChange}
              />
              <p className="page-input_item-input-desc">클라이언트 토큰을 입력해주세요.</p>
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">모니터링 API URL</div>
            <div className="page-input_item-data">
              <Input
                placeholder="모니터링 API URL을 입력해주세요."
                value={monitServerURL}
                onChange={onMonitServerURLChange}
                variant={validationErrors.monitServerURL ? 'err' : 'default'}
              />
              <p className="page-input_item-input-desc">
                클러스터 모니터링을 위한 API URL을 입력해주세요. (http:// 또는 https://로 시작)
              </p>
              {validationErrors.monitServerURL && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.monitServerURL}
                </p>
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
              <p className="page-input_item-input-desc">
                클러스터에 대한 간단한 설명을 입력해주세요. (최대 500자)
              </p>
              {validationErrors.description && (
                <p
                  className="page-input_item-input-error"
                  style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}
                >
                  {validationErrors.description}
                </p>
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
              onClick={() => {
                // returnTo가 있으면 해당 경로로, 없으면 클러스터 목록으로 이동
                const targetPath = returnTo || '/infra-management/cluster-management';
                navigate(targetPath);
              }}
            >
              취소
            </Button>
            <Button
              size="large"
              color="primary"
              onClick={handleUpdateCluster}
              disabled={isUpdating}
            >
              {isUpdating ? '수정' : '수정'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
