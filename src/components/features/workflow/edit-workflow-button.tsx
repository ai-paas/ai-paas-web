import { Button, useTableSelection } from "@innogrid/ui";

export const EditWorkflowButton = () => {
  const { rowSelection } = useTableSelection();

  const handleClick = () => {
    console.log(rowSelection);
  };

  return (
    <Button onClick={handleClick} size="medium" color="secondary">
      편집
    </Button>
  );
};
