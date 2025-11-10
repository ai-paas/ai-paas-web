import { Button } from '@innogrid/ui';

export const EditModelCatalogButton = ({ modelCatalogId }: { modelCatalogId: number | null }) => {
  return (
    <Button onClick={() => {}} size="medium" color="secondary" disabled={!modelCatalogId}>
      편집
    </Button>
  );
};
