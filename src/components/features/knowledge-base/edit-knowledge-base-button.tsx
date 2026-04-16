import { Button } from '@innogrid/ui';
import { useNavigate } from 'react-router';

export const EditKnowledgeBaseButton = ({ knowledgeBaseId }: { knowledgeBaseId?: number }) => {
  const navigate = useNavigate();

  return (
    <Button
      size="medium"
      color="secondary"
      disabled={!knowledgeBaseId}
      onClick={() => navigate(`/knowledge-base/${knowledgeBaseId}/edit`)}
    >
      편집
    </Button>
  );
};
