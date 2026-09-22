import { Button, Input, Modal, useToast } from '@innogrid/ui';
import { useEffect, useState } from 'react';

import { useCreateHelmRepository } from '@/hooks/service/helm';
import type { HelmRepositoryCreateRequest } from '@/types/helm';

import styles from './helm-repository-modal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const EMPTY = {
  name: '',
  url: '',
  username: '',
  password: '',
  caFile: '',
  insecureSkipTLSVerify: false,
};

/** 이름은 helm 이 alias 로 쓴다 — 공백이나 대문자가 들어가면 차트 참조가 어긋난다. */
const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export const HelmRepositoryModal = ({ isOpen, onClose }: Props) => {
  const { open: openToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY);
      setTouched(false);
    }
  }, [isOpen]);

  const nameError = !form.name
    ? '저장소 이름을 입력해주세요.'
    : NAME_PATTERN.test(form.name)
      ? ''
      : '소문자, 숫자, - 만 쓸 수 있습니다.';
  const urlError = !form.url
    ? '저장소 URL 을 입력해주세요.'
    : /^https?:\/\//.test(form.url)
      ? ''
      : 'http 또는 https 로 시작해야 합니다.';
  const canSubmit = !nameError && !urlError;

  const { createHelmRepository, isPending } = useCreateHelmRepository({
    onSuccess: (_data, request) => {
      openToast({ title: `${request.name} 저장소를 연동했습니다.` });
      onClose();
    },
    onError: (error) => {
      openToast({
        title: error instanceof Error ? error.message : '저장소 연동에 실패했습니다.',
        status: 'error',
      });
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    const request: HelmRepositoryCreateRequest = {
      name: form.name.trim(),
      url: form.url.trim(),
      username: form.username.trim(),
      password: form.password,
      caFile: form.caFile.trim(),
      insecureSkipTLSVerify: form.insecureSkipTLSVerify,
    };
    createHelmRepository(request);
  };

  const set = (key: keyof typeof EMPTY, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      title="헬름 저장소 연동"
      buttonTitle={isPending ? '연동 중...' : '연동'}
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
        <label className={styles.field}>
          <span className={styles.label}>
            이름 <em>*</em>
          </span>
          <Input
            value={form.name}
            placeholder="prometheus-community"
            disabled={isPending}
            onChange={(e) => set('name', e.target.value)}
          />
          {touched && nameError && <span className={styles.error}>{nameError}</span>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            URL <em>*</em>
          </span>
          <Input
            value={form.url}
            placeholder="https://prometheus-community.github.io/helm-charts"
            disabled={isPending}
            onChange={(e) => set('url', e.target.value)}
          />
          {touched && urlError && <span className={styles.error}>{urlError}</span>}
        </label>

        {/* 공개 저장소는 인증이 없다. 필수로 두면 대부분의 저장소를 못 넣는다. */}
        <label className={styles.field}>
          <span className={styles.label}>사용자</span>
          <Input
            value={form.username}
            placeholder="비공개 저장소만"
            disabled={isPending}
            onChange={(e) => set('username', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>비밀번호</span>
          <Input
            type="password"
            value={form.password}
            placeholder="비공개 저장소만"
            disabled={isPending}
            onChange={(e) => set('password', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>CA 인증서</span>
          <textarea
            className={styles.textarea}
            value={form.caFile}
            placeholder="사설 인증서를 쓰는 저장소만 (PEM)"
            disabled={isPending}
            rows={4}
            onChange={(e) => set('caFile', e.target.value)}
          />
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={form.insecureSkipTLSVerify}
            disabled={isPending}
            onChange={(e) => set('insecureSkipTLSVerify', e.target.checked)}
          />
          TLS 검증 건너뛰기
        </label>
      </div>
    </Modal>
  );
};
