import { Button, useTableSelection } from "@innogrid/ui";
import { useNavigate } from "react-router";

export const EditWorkflowButton = () => {
  const { setRowSelection, rowSelection } = useTableSelection();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log(rowSelection);
  };

  return (
    <Button onClick={handleClick} size="medium" color="secondary">
      편집
    </Button>
  );
};
