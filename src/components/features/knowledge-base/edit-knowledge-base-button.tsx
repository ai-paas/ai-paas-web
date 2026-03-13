import { Button } from '@innogrid/ui';

export const EditKnowledgeBaseButton = ({ knowledgeBaseId }: { knowledgeBaseId?: number }) => {
  return (
    <Button size="medium" color="secondary" disabled={!knowledgeBaseId}>
      편집
    </Button>
  );
};
