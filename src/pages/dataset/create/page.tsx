import { BreadCrumb } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { DatasetForm } from '@/components/features/dataset/dataset-form';

export default function DatasetCreatePage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[{ label: '데이터 셋', path: '/dataset' }, { label: '데이터 셋 생성' }]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <DatasetForm />
    </main>
  );
}
