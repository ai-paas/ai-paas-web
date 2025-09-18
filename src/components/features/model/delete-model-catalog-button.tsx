import { AlertDialog, Button } from "@innogrid/ui";
import { useState } from "react";

export const DeleteModelCatalogButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickConfirm = () => {
    console.log("삭제");
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="medium" color="negative">
        삭제
      </Button>
      <AlertDialog
        isOpen={isOpen}
        confirmButtonText="확인"
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => setIsOpen(false)}
        size="small"
      >
        <span>모델 카탈로그를 삭제하시겠습니까?</span>
      </AlertDialog>
    </>
  );
};
