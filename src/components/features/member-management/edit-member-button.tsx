import { Button } from '@innogrid/ui';
import { useNavigate } from 'react-router';

interface EditMemberButtonProps {
  selectedMemberId?: string | null;
}

export const EditMemberButton = ({ selectedMemberId }: EditMemberButtonProps) => {
  const navigate = useNavigate();
  const hasSelection = !!selectedMemberId;

  return (
    <Button
      size="medium"
      color="secondary"
      disabled={!hasSelection}
      title={hasSelection ? '' : '편집할 멤버를 선택해 주세요.'}
      onClick={() => hasSelection && navigate(`/member-management/${selectedMemberId}/edit`)}
    >
      편집
    </Button>
  );
};
