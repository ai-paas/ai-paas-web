import { Button } from "@innogrid/ui";
import { useNavigate } from "react-router";

export const CreateLearningButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/learning/create")}
      size="medium"
      color="primary"
    >
      생성
    </Button>
  );
};
