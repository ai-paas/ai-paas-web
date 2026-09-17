import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Modal, useToast, type CheckboxCheckedState } from '@innogrid/ui';
import { useUpdateCredential } from '@/hooks/service/credentials';
import { getServerErrorMessage } from '@/lib/api';

interface EditableCredential {
  id?: string;
  name?: string;
  provider?: string;
  description?: string;
  credentialKeys?: string[];
}

interface Props {
  isOpen: boolean;
  credential: EditableCredential;
  onClose: () => void;
}

/**
 * 자격증명 수정.
 *
 * <p>이름과 프로바이더는 바꿀 수 없다 — vm_cluster 가 프로비저닝 당시 이름을 기록으로 들고 있고,
 * 프로바이더가 바뀌면 키 구성 자체가 달라진다. 읽기 전용으로 보여주기만 한다.
 *
 * <p>값은 통째로 교체한다. 부분 수정은 AWS 의 ID/시크릿처럼 짝이 있는 키에서 못 쓰는 조합을 만든다.
 */
export const CredentialEditModal = ({ isOpen, credential, onClose }: Props) => {
  const { open } = useToast();
  const keys = credential.credentialKeys ?? [];

  const [description, setDescription] = useState(credential.description ?? '');
  const [replaceValues, setReplaceValues] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setDescription(credential.description ?? '');
      setReplaceValues(false);
      setValues({});
    }
  }, [isOpen, credential.description]);

  const { updateCredential, isPending } = useUpdateCredential({
    onSuccess: () => {
      open({ title: '자격증명을 수정했습니다.' });
      onClose();
    },
    onError: (error) =>
      open({
        title: '자격증명 수정 실패',
        children: getServerErrorMessage(error, '잠시 후 다시 시도해주세요.'),
        status: 'negative',
      }),
  });

  // 한 칸이라도 비면 저장을 막는다. 빈 값으로 덮으면 조용히 못 쓰는 자격증명이 된다.
  const allFilled = keys.every((k) => (values[k] ?? '').trim().length > 0);
  const canSave = !isPending && (!replaceValues || allFilled);

  const handleSave = () => {
    if (!canSave || !credential.id) return;
    updateCredential({
      credentialId: credential.id,
      description,
      credentials: replaceValues ? values : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`자격증명 수정 — ${credential.name ?? ''}`}
      size="medium"
      onRequestClose={onClose}
      action={handleSave}
      buttonTitle="저장"
      buttonDisabled={!canSave}
      isButtonLoading={isPending}
      subButton={
        <Button size="large" color="secondary" onClick={onClose}>
          취소
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="page-input_item-name">이름</div>
          <div style={{ color: '#666' }}>{credential.name ?? '-'}</div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="page-input_item-name">프로바이더</div>
          <div style={{ color: '#666' }}>{credential.provider ?? '-'}</div>
        </div>
        <span style={{ fontSize: 12, color: '#666' }}>
          이름과 프로바이더는 바꿀 수 없습니다. 이미 만들어진 클러스터가 이 이름을 기록으로 들고
          있습니다.
        </span>

        <div className="flex flex-col gap-2.5">
          <label className="page-input_item-name" htmlFor="credential-description">
            설명
          </label>
          <Input
            id="credential-description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          />
        </div>

        <Checkbox
          id="credential-replace-values"
          label="값 교체"
          checked={replaceValues}
          onCheckedChange={(c: CheckboxCheckedState) => setReplaceValues(c === true)}
        />

        {replaceValues && (
          <>
            <span style={{ color: '#a33', fontSize: 12, lineHeight: 1.5 }}>
              값은 통째로 바뀝니다. 저장하면 이전 가용성 확인 결과가 지워지니, 저장 후 목록에서
              가용성 확인을 눌러주세요.
            </span>
            {keys.map((key) => (
              <div key={key} className="flex flex-col gap-2.5">
                <label className="page-input_item-name" htmlFor={`credential-value-${key}`}>
                  {key}
                </label>
                <Input
                  id={`credential-value-${key}`}
                  type="password"
                  value={values[key] ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};
