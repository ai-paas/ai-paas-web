import { BreadCrumb } from '@innogrid/ui';
import { useNavigate } from 'react-router';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import styles from '../../workflow.module.scss';

export default function WorkflowTemplateCreatePage() {
  const navigate = useNavigate();

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '워크플로우', path: '/workflow/workflow' },
            { label: '워크플로우 템플릿', path: '/workflow/templates' },
            { label: '템플릿 생성' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor initialName="" initialNodes={[]} initialEdges={[]} mode="template" />
      </div>
    </main>
  );
}
