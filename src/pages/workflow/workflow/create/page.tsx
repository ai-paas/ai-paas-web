import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BreadCrumb } from '@innogrid/ui';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import { workflowToFlow } from '@/components/features/workflow/workflow-editor/workflow-to-flow';
import { useGetWorkflowTemplate } from '@/hooks/service/workflows';
import styles from '../../workflow.module.scss';

export default function WorkflowCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') ?? undefined;
  const { workflowTemplate, isPending, isError } = useGetWorkflowTemplate(templateId);
  const { nodes, edges } = useMemo(() => workflowToFlow(workflowTemplate), [workflowTemplate]);

  if (templateId && isPending) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 생성' },
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

  if (templateId && (isError || !workflowTemplate)) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: '워크플로우 생성' },
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
            { label: '워크플로우 생성' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor
          key={templateId ?? 'create'}
          initialName={workflowTemplate?.name ?? ''}
          initialNodes={nodes}
          initialEdges={edges}
        />
      </div>
    </main>
  );
}
