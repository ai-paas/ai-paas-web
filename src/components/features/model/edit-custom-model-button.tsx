import { Button } from '@innogrid/ui';

export const EditCustomModelButton = ({ modelId }: { modelId: number | null }) => {
  return (
    <Button size="medium" color="secondary" disabled={!modelId}>
      편집
    </Button>
  );
};
