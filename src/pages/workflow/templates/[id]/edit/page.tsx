import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadCrumb } from '@innogrid/ui';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import { workflowToFlow } from '@/components/features/workflow/workflow-editor/workflow-to-flow';
import { useGetWorkflowTemplate } from '@/hooks/service/workflows';
import styles from '../../../workflow.module.scss';

export default function WorkflowTemplateEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { workflowTemplate, isPending, isError } = useGetWorkflowTemplate(id);
  const { nodes, edges } = useMemo(() => workflowToFlow(workflowTemplate), [workflowTemplate]);

  if (isPending) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 템플릿', path: '/workflow/templates' },
              { label: workflowTemplate?.name ?? '' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className={styles.container}>
          <div className="flex size-full items-center justify-center">Loading template...</div>
        </div>
      </main>
    );
  }

  if (!id || isError || !workflowTemplate) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 템플릿', path: '/workflow/templates' },
              { label: '템플릿 편집' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className={styles.container}>
          <div className="flex size-full items-center justify-center">Failed to load template.</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '워크플로우', path: '/workflow/workflow' },
            { label: '워크플로우 템플릿', path: '/workflow/templates' },
            { label: workflowTemplate.name },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor
          key={id}
          initialName={workflowTemplate.name}
          initialNodes={nodes}
          initialEdges={edges}
          mode="templateEdit"
          templateId={id}
          templateDescription={workflowTemplate.description}
          templateCategory={workflowTemplate.category}
          status={workflowTemplate.status}
        />
      </div>
    </main>
  );
}
