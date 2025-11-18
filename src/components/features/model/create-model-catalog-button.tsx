import { Button } from '@innogrid/ui';
import { useNavigate } from 'react-router';

export const CreateModelCatalogButton = () => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/model/model-catalog/create')} size="medium" color="primary">
      생성
    </Button>
  );
};
