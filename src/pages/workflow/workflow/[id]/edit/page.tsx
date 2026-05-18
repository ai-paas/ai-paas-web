import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadCrumb } from '@innogrid/ui';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import { workflowToFlow } from '@/components/features/workflow/workflow-editor/workflow-to-flow';
import { useGetWorkflow } from '@/hooks/service/workflows';
import styles from '../../../workflow.module.scss';

export default function WorkflowEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { workflow, isPending, isError } = useGetWorkflow(id, !!id);

  const { nodes, edges } = useMemo(() => workflowToFlow(workflow), [workflow]);

  if (isPending) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: workflow?.name ?? '' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className={styles.container}>
          <div className="flex size-full items-center justify-center">Loading workflow...</div>
        </div>
      </main>
    );
  }

  if (!id || isError || !workflow) {
    return (
      <main>
        <div className="breadcrumbBox">
          <BreadCrumb
            items={[
              { label: '워크플로우', path: '/workflow/workflow' },
              { label: workflow?.name ?? '' },
            ]}
            onNavigate={navigate}
          />
        </div>
        <div className={styles.container}>
          <div className="flex size-full items-center justify-center">Failed to load workflow.</div>
        </div>
      </main>
    );
  }

  const workflowId = workflow.surro_workflow_id || id;

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[
            { label: '워크플로우', path: '/workflow/workflow' },
            { label: workflow?.name ?? '' },
          ]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor
          key={workflowId}
          initialName={workflow.name}
          initialNodes={nodes}
          initialEdges={edges}
          mode="edit"
          workflowId={workflowId}
          status={workflow.status}
          serviceId={workflow.service_id}
        />
      </div>
    </main>
  );
}
