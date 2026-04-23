import { Button } from "@innogrid/ui";

export const EditLearningButton = ({ experimentId }: { experimentId?: number }) => {
  return (
    <Button size="medium" color="secondary" disabled={!experimentId}>
      편집
    </Button>
  );
};
