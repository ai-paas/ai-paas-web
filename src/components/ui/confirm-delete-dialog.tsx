import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Modal, type CheckboxCheckedState } from '@innogrid/ui';

interface Props {
  isOpen: boolean;
  /** '클러스터', 'VM', '자격증명' — 무엇을 지우는지 */
  resourceType: string;
  /** 단건일 때의 이름. 이 이름을 그대로 쳐야 삭제된다. */
  resourceName?: string;
  /** 여러 건일 때의 개수. 이름을 다 치게 하면 일괄 삭제가 실질적으로 막힌다. */
  count?: number;
  /** 함께 사라지는 것. 노드 수처럼 실제 값을 넣는다. */
  consequence?: string;
  /** destroy 없이 기록만 지우는 선택지를 노출할지 */
  allowForce?: boolean;
  isPending?: boolean;
  onConfirm: (options: { force: boolean }) => void;
  onClose: () => void;
}

export const ConfirmDeleteDialog = ({
  isOpen,
  resourceType,
  resourceName,
  count,
  consequence,
  allowForce = false,
  isPending = false,
  onConfirm,
  onClose,
}: Props) => {
  const [typed, setTyped] = useState('');
  const [force, setForce] = useState(false);

  // 닫았다 다시 열면 앞서 친 이름이 남아 있으면 안 된다.
  useEffect(() => {
    if (!isOpen) {
      setTyped('');
      setForce(false);
    }
  }, [isOpen]);

  const needsName = !!resourceName;
  const canDelete = !isPending && (!needsName || typed === resourceName);

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm({ force });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`${resourceType} 삭제`}
      size="small"
      onRequestClose={onClose}
      action={handleConfirm}
      buttonTitle={`${resourceType} 삭제 확인`}
      buttonDisabled={!canDelete}
      isButtonLoading={isPending}
      subButton={
        <Button size="large" color="secondary" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p>
          {needsName
            ? `제거되면 ${resourceType}에 더 이상 접근할 수 없습니다.`
            : `선택한 ${count ?? 0}개의 ${resourceType}을 제거합니다.`}
        </p>
        {consequence && <p>{consequence}</p>}
        <p style={{ color: '#d03', fontWeight: 600 }}>이 작업은 되돌릴 수 없습니다.</p>

        {allowForce && (
          <>
            <Checkbox
              id="confirm-delete-force"
              label="강제 삭제 — destroy 없이 기록만 제거"
              checked={force}
              onCheckedChange={(c: CheckboxCheckedState) => setForce(c === true)}
            />
            {force && (
              <span style={{ color: '#a33', fontSize: 12, lineHeight: 1.5 }}>
                destroy 를 돌리지 않습니다. 클라우드에 자원이 남아 요금이 계속될 수 있으니, 삭제가
                반복해서 실패하는 경우에만 사용하고 콘솔에서 직접 확인해주세요.
              </span>
            )}
          </>
        )}

        {needsName && (
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name">
              {resourceType} <strong>{resourceName}</strong> 확인을 위해 이름을 입력해주세요.
            </div>
            <Input
              placeholder="확인 입력"
              value={typed}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTyped(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};
