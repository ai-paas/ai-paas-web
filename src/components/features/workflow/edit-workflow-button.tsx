import { Button } from '@innogrid/ui';
import { useNavigate } from 'react-router';

interface EditWorkflowButtonProps {
  workflowId?: string;
}

export const EditWorkflowButton = ({ workflowId }: EditWorkflowButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (workflowId) {
      navigate(`/workflow/${workflowId}/edit`);
    }
  };

  return (
    <Button onClick={handleClick} size="medium" color="secondary" disabled={!workflowId}>
      편집
    </Button>
  );
};
