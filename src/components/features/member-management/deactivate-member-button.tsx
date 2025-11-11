// src/components/features/member-management/deactivate-member-button.tsx
import { Button } from '@innogrid/ui';
import { useMemo } from 'react';
import { useUpdateMember } from '@/hooks/service/member';

type Props = {
  selectedMemberId: string | null | undefined;
  selectedIsActive?: boolean | null;
};

export function DeactivateMemberButton({ selectedMemberId, selectedIsActive }: Props) {
  const { updateMember, isPending } = useUpdateMember();

  const disabled = useMemo(() => {
    // 선택 없음 또는 이미 비활성화면 비활성화
    return !selectedMemberId || selectedIsActive === false;
  }, [selectedMemberId, selectedIsActive]);

  const onClick = () => {
    if (!selectedMemberId) return;
    console.log('Deactivating member with ID:', selectedMemberId);
    updateMember({ member_id: selectedMemberId, is_active: false });
  };

  return (
    <Button
      size="medium"
      color="negative"
      onClick={onClick}
      disabled={disabled || isPending}
      aria-label="멤버 비활성화 (Deactivate member)"
    >
      {isPending ? '비활성화 중…' : '비활성화'}
    </Button>
  );
}
