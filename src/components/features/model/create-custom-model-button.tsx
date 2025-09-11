import { Button, SelectButton, SelectButtonItem } from 'innogrid-ui';
import { useNavigate } from 'react-router';

export const CreateCustomModelButton = () => {
  const navigate = useNavigate();

  return (
    <>
      <SelectButton title="생성" color="focus">
        <SelectButtonItem onClick={() => navigate('/model/custom-model/create')}>
          커스텀 모델
        </SelectButtonItem>
        <SelectButtonItem onClick={() => navigate('/model/custom-model/create/huggingface')}>
          허깅페이스 연동
        </SelectButtonItem>
        <SelectButtonItem onClick={() => navigate('/model/custom-model/create/etri')}>
          etri 연동
        </SelectButtonItem>
      </SelectButton>
    </>
  );
};
