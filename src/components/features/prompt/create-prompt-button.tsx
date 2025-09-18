import { Button } from "@innogrid/ui";
import { useNavigate } from "react-router";

export const CreatePromptButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/prompt/create")}
      size="medium"
      color="primary"
    >
      생성
    </Button>
  );
};
