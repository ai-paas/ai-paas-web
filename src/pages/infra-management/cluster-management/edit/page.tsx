import { useState, useCallback, useEffect } from 'react';
import { BreadCrumb, Button, Input, useToast } from '@innogrid/ui';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useGetCluster, useUpdateCluster } from '@/hooks/service/clusters';
import styles from '../create/page.module.scss';

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
};

export default function ClusterEditPage() {
  const navigate = useNavigate();
  const { open } = useToast();
  const { clusterId } = useParams<{ clusterId: string }>();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const { cluster, isPending: isLoading } = useGetCluster(clusterId);

  const [workerCount, setWorkerCount] = useState<string>('');
  const [workerCountError, setWorkerCountError] = useState<string | undefined>();

  useEffect(() => {
    if (cluster?.workerCount !== undefined) {
      setWorkerCount(String(cluster.workerCount));
    }
  }, [cluster]);

  const handleSuccess = useCallback(() => {
    open({ title: '클러스터가 성공적으로 수정되었습니다.' });
    navigate(returnTo || '/infra-management/cluster-management');
  }, [open, navigate, returnTo]);

  const handleError = useCallback(
    (error: unknown) => {
      const message = extractErrorMessage(error, '클러스터 수정 중 오류가 발생했습니다.');
      open({ title: message, status: 'negative' });
    },
    [open]
  );

  const { updateCluster, isPending: isUpdating } = useUpdateCluster({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const isVmSource = cluster?.source === 'vm';
  const isRegisteredSource = cluster?.source === 'registered';

  const handleSubmit = () => {
    if (!clusterId) return;

    if (!isVmSource) {
      open({
        title: '외부 등록 클러스터는 수정할 수 없습니다.',
        status: 'negative',
      });
      return;
    }

    const parsed = Number(workerCount);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
      setWorkerCountError('워커 노드 수는 1~50 사이의 정수여야 합니다.');
      return;
    }
    setWorkerCountError(undefined);

    updateCluster({
      clusterName: clusterId,
      spec: { workerCount: parsed },
    });
  };

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '인프라 관리' },
            { label: '클러스터 관리', path: '/infra-management/cluster-management' },
            { label: '클러스터 편집' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">클러스터 편집</h2>
      </div>
      <div className="page-content page-pb-40">
        {isLoading ? (
          <div style={{ padding: 24, color: '#666' }}>클러스터 정보를 불러오는 중입니다...</div>
        ) : (
          <div className="page-input-box">
            {/* 클러스터 기본 정보 (read-only) */}
            <div className="page-input_item-box">
              <div className="page-input_item-name">클러스터 이름</div>
              <div className="page-input_item-data">
                <Input value={cluster?.clusterName ?? clusterId ?? ''} disabled />
              </div>
            </div>
            <div className="page-input_item-box">
              <div className="page-input_item-name">소스</div>
              <div className="page-input_item-data">
                <Input value={cluster?.source ?? '-'} disabled />
              </div>
            </div>
            <div className="page-input_item-box">
              <div className="page-input_item-name">프로바이더</div>
              <div className="page-input_item-data">
                <Input value={cluster?.provider ?? '-'} disabled />
              </div>
            </div>
            {isVmSource && (
              <div className="page-input_item-box">
                <div className="page-input_item-name">리전</div>
                <div className="page-input_item-data">
                  <Input value={cluster?.region ?? '-'} disabled />
                </div>
              </div>
            )}
            <div className="page-input_item-box">
              <div className="page-input_item-name">상태</div>
              <div className="page-input_item-data">
                <Input value={cluster?.status ?? '-'} disabled />
              </div>
            </div>

            {/* 수정 가능 영역 */}
            {isVmSource && (
              <div className="page-input_item-box">
                <div className="page-input_item-name page-icon-requisite">워커 노드 수</div>
                <div className="page-input_item-data">
                  <Input
                    type="number"
                    placeholder="1~50"
                    value={workerCount}
                    onChange={(e) => setWorkerCount(e.target.value)}
                    variant={workerCountError ? 'err' : 'default'}
                  />
                  {workerCountError && (
                    <p className="page-input_item-input-error">{workerCountError}</p>
                  )}
                </div>
              </div>
            )}

            {isRegisteredSource && (
              <div className={styles.radioGroup} style={{ padding: 16 }}>
                <p style={{ color: '#666' }}>
                  외부 등록 클러스터는 메타데이터 수정을 지원하지 않습니다. 변경이 필요하면 삭제 후
                  재등록해주세요.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button
              size="large"
              color="secondary"
              onClick={() => navigate(returnTo || '/infra-management/cluster-management')}
            >
              취소
            </Button>
            <Button
              size="large"
              color="primary"
              onClick={handleSubmit}
              disabled={isUpdating || !isVmSource}
            >
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
