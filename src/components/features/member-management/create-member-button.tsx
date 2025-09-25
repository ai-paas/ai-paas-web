import { Button } from '@innogrid/ui';
import { useNavigate } from 'react-router';

export const CreateMemberButton = () => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/member-management/create')} size="medium" color="primary">
      생성
    </Button>
  );
};
