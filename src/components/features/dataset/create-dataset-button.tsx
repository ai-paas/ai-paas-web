import { Button } from "@innogrid/ui";
import { useNavigate } from "react-router";

export const CreateDatasetButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/dataset/create")}
      size="medium"
      color="primary"
    >
      생성
    </Button>
  );
};
