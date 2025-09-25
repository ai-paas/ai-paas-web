import { Button } from "@innogrid/ui";
import { useNavigate } from "react-router";

export const CreateKnowledgeBaseButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/knowledge-base/create")}
      size="medium"
      color="primary"
    >
      생성
    </Button>
  );
};
