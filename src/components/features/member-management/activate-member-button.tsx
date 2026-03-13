// src/components/features/member-management/activate-member-button.tsx
import { Button } from '@innogrid/ui';
import { useMemo } from 'react';
import { useUpdateMember } from '@/hooks/service/member';

type Props = {
  selectedMemberId: string | null | undefined;
  selectedIsActive?: boolean | null;
};

export function ActivateMemberButton({ selectedMemberId, selectedIsActive }: Props) {
  const { updateMember, isPending } = useUpdateMember();

  const disabled = useMemo(() => {
    return !selectedMemberId || selectedIsActive === true;
  }, [selectedMemberId, selectedIsActive]);

  const onClick = () => {
    if (!selectedMemberId) return;
    updateMember({ member_id: selectedMemberId, is_active: true });
  };

  return (
    <Button
      size="medium"
      color="primary"
      onClick={onClick}
      disabled={disabled || isPending}
      aria-label="멤버 활성화 (Activate member)"
    >
      {isPending ? '활성화 중…' : '활성화'}
    </Button>
  );
}
