import { Button, Input, Modal, Select, useToast, type SelectSingleValue } from '@innogrid/ui';
import { useEffect, useMemo, useState } from 'react';

import { useGetClusters, useGetKubernetesNamespaces } from '@/hooks/service/clusters';
import { useScopedCluster } from '@/hooks/use-scoped-cluster';
import { useGetCatalogValues } from '@/hooks/service/catalog';
import { useGetHelmRepositories, useInstallHelmRelease } from '@/hooks/service/helm';

import styles from './install-release-panel.module.scss';

type PanelOption = { text: string; value: string };

export type InstallTarget = {
  repoName: string;
  chartName: string;
  version?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  target: InstallTarget;
  /** 업그레이드면 클러스터, 네임스페이스, 이름이 이미 정해져 있어 고르지 않는다. */
  mode?: 'install' | 'upgrade';
  fixed?: { clusterName: string; namespace: string; releaseName: string };
  onDone?: () => void;
};

/** helm 릴리즈 이름 규칙. 어기면 설치가 거절되는데 메시지는 helm 원문으로 온다. */
const RELEASE_NAME_PATTERN = /^[a-z0-9][a-z0-9-]{0,52}$/;

/**
 * 차트를 고른 자리에서 바로 설치한다.
 *
 * <p>저장소, 차트, 버전은 이미 정해진 채로 들어오므로 다시 묻지 않는다. 생성 화면이 그 셋을
 * 드롭다운으로 되물어, 카탈로그에서 눈으로 고른 것을 한 번 더 고르게 만들고 있었다.
 */
export const InstallReleasePanel = ({
  isOpen,
  onClose,
  target,
  mode = 'install',
  fixed,
  onDone,
}: Props) => {
  const { open: openToast } = useToast();
  const isUpgrade = mode === 'upgrade';

  /*
   * helm 릴리즈에는 어느 저장소에서 왔는지가 남지 않는다. 업그레이드에서는 사용자가 고른다 —
   * 이름만 보고 짐작하면 같은 이름의 다른 차트를 올릴 수 있다.
   */
  const [repoName, setRepoName] = useState(target.repoName);
  const { repositories } = useGetHelmRepositories();
  const needsRepoChoice = !target.repoName;

  const [clusterName, setClusterName] = useState(fixed?.clusterName ?? '');
  const [namespace, setNamespace] = useState(fixed?.namespace ?? '');
  const [releaseName, setReleaseName] = useState(fixed?.releaseName ?? target.chartName);
  const [valuesYaml, setValuesYaml] = useState('');
  const [touched, setTouched] = useState(false);

  const { clusterName: scopedCluster, setClusterName: setScopedCluster } = useScopedCluster();
  const { clusters } = useGetClusters();
  const { namespaces } = useGetKubernetesNamespaces(clusterName, !!clusterName);
  const { data: valuesData } = useGetCatalogValues(repoName, target.chartName, target.version);

  useEffect(() => {
    if (!isOpen) return;
    setTouched(false);
    setReleaseName(fixed?.releaseName ?? target.chartName);
    if (fixed?.clusterName) {
      setClusterName(fixed.clusterName);
      setNamespace(fixed.namespace);
      return;
    }
    // 섹션이 공유하는 클러스터를 그대로 쓴다. 화면을 옮길 때마다 다시 고르게 하지 않는다.
    setClusterName((prev) => prev || scopedCluster);
  }, [isOpen, fixed, target.chartName, scopedCluster]);

  useEffect(() => {
    if (valuesData?.content) setValuesYaml(valuesData.content);
  }, [valuesData?.content]);

  const clusterOptions = useMemo(
    () => clusters.map((c) => ({ text: c.clusterName ?? c.id ?? '', value: c.id ?? '' })),
    [clusters]
  );
  const namespaceOptions = useMemo(
    () => namespaces.map((ns) => ({ text: ns.metadata.name, value: ns.metadata.name })),
    [namespaces]
  );

  const repoOptions = useMemo(
    () => repositories.map((r) => ({ text: r.name ?? '', value: r.name ?? '' })),
    [repositories]
  );
  const repoError = repoName ? '' : '저장소를 선택해주세요.';
  const clusterError = clusterName ? '' : '클러스터를 선택해주세요.';
  const namespaceError = namespace ? '' : '네임스페이스를 선택해주세요.';
  const nameError = !releaseName
    ? '릴리즈 이름을 입력해주세요.'
    : RELEASE_NAME_PATTERN.test(releaseName)
      ? ''
      : '소문자, 숫자, - 로 53자까지 쓸 수 있습니다.';
  const canSubmit = !repoError && !clusterError && !namespaceError && !nameError;

  const { installHelmRelease, isPending } = useInstallHelmRelease(clusterName, {
    onSuccess: () => {
      setScopedCluster(clusterName);
      openToast({
        title: isUpgrade ? '업그레이드 요청을 보냈습니다.' : '설치 요청을 보냈습니다.',
      });
      onDone?.();
      onClose();
    },
    onError: (error) => {
      openToast({
        title: error instanceof Error ? error.message : '요청에 실패했습니다.',
        status: 'error',
      });
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    installHelmRelease({
      releaseName,
      chart: `${repoName}/${target.chartName}`,
      ...(target.version ? { version: target.version } : {}),
      namespace,
      ...(valuesYaml.trim() ? { valuesYaml } : {}),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      size="large"
      title={isUpgrade ? '헬름 릴리즈 업그레이드' : '헬름 차트 설치'}
      buttonTitle={isPending ? '요청 중...' : isUpgrade ? '업그레이드' : '설치'}
      action={handleSubmit}
      onRequestClose={() => !isPending && onClose()}
      buttonDisabled={isPending}
      isButtonLoading={isPending}
      subButton={
        <Button size="large" color="secondary" onClick={onClose} disabled={isPending}>
          닫기
        </Button>
      }
    >
      <div className={styles.form}>
        {/* 무엇을 설치 중인지 화면에서 사라지지 않게 고정해 둔다. */}
        <div className={styles.target} data-testid="install-target">
          <span className={styles.targetChart}>
            {repoName ? `${repoName} / ` : ''}
            {target.chartName}
          </span>
          {target.version && <span className={styles.targetVersion}>v{target.version}</span>}
        </div>

        {needsRepoChoice && (
          <label className={styles.field}>
            <span className={styles.label}>
              저장소 <em>*</em>
            </span>
            <Select
              options={repoOptions}
              value={repoOptions.find((o) => o.value === repoName)}
              placeholder="저장소를 선택하세요"
              isDisabled={isPending}
              onChange={(option: SelectSingleValue<PanelOption>) => setRepoName(option?.value ?? '')}
            />
            {touched && repoError && <span className={styles.error}>{repoError}</span>}
          </label>
        )}

        <label className={styles.field}>
          <span className={styles.label}>
            클러스터 <em>*</em>
          </span>
          <Select
            options={clusterOptions}
            value={clusterOptions.find((o) => o.value === clusterName)}
            placeholder="클러스터를 선택하세요"
            isDisabled={isPending || isUpgrade}
            onChange={(option: SelectSingleValue<PanelOption>) => setClusterName(option?.value ?? '')}
          />
          {touched && clusterError && <span className={styles.error}>{clusterError}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            네임스페이스 <em>*</em>
          </span>
          <Select
            options={namespaceOptions}
            value={namespaceOptions.find((o) => o.value === namespace)}
            placeholder={clusterName ? '네임스페이스를 선택하세요' : '클러스터를 먼저 고르세요'}
            isDisabled={isPending || isUpgrade || !clusterName}
            onChange={(option: SelectSingleValue<PanelOption>) => setNamespace(option?.value ?? '')}
          />
          {touched && namespaceError && <span className={styles.error}>{namespaceError}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            릴리즈 이름 <em>*</em>
          </span>
          <Input
            value={releaseName}
            disabled={isPending || isUpgrade}
            onChange={(e) => setReleaseName(e.target.value)}
          />
          {touched && nameError && <span className={styles.error}>{nameError}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>값 (values.yaml)</span>
          <textarea
            className={styles.textarea}
            value={valuesYaml}
            rows={14}
            disabled={isPending}
            onChange={(e) => setValuesYaml(e.target.value)}
          />
        </label>
      </div>
    </Modal>
  );
};
