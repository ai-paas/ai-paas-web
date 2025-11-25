import { Button } from '@innogrid/ui';

export const EditCustomModelButton = ({ customModelId }: { customModelId?: number }) => {
  return (
    <Button size="medium" color="secondary" disabled={!customModelId}>
      편집
    </Button>
  );
};
