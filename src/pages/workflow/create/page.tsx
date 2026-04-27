import { useNavigate } from 'react-router';
import { BreadCrumb } from '@innogrid/ui';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import styles from '../workflow.module.scss';

export default function WorkflowCreatePage() {
  const navigate = useNavigate();

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '워크플로우', path: '/workflow' }, { label: '워크플로우 생성' }]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor initialNodes={[]} initialEdges={[]} />
      </div>
    </main>
  );
}
