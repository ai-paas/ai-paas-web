import { ReactFlowProvider, type Edge } from '@xyflow/react';
import { WorkflowComponentPanel } from './workflow-component-panel';
import { FlowChart } from '@/components/ui/flow-chart';
import { ChecklistWorkflowButton } from './checklist-workflow-button';
import { SubmitWorkflowButton } from './submit-workflow-button';
import { UpdateWorkflowButton } from './update-workflow-button';
import { WorkflowSettingPanel } from './workflow-setting-panel';
import styles from '@/pages/workflow/workflow.module.scss';
import type { WorkflowNode } from '@/store/useWorkflowStore';
import type { WorkflowStatus } from '@/types/workflow';

interface WorkflowEditorProps {
  initialNodes: WorkflowNode[];
  initialEdges: Edge[];
  initialName?: string;
  mode?: 'create' | 'edit';
  workflowId?: string;
  status?: WorkflowStatus;
  serviceId?: string;
}

export const WorkflowEditor = ({
  initialNodes,
  initialEdges,
  initialName,
  mode = 'create',
  workflowId,
  status,
  serviceId,
}: WorkflowEditorProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowComponentPanel initialName={initialName} />

      <div className={styles.contentBox}>
        <div className="size-full">
          <FlowChart initialNodes={initialNodes} initialEdges={initialEdges} />
        </div>

        <div className="absolute top-5 right-5 flex gap-1.5">
          <ChecklistWorkflowButton />
          {mode === 'edit' && workflowId ? (
            <UpdateWorkflowButton workflowId={workflowId} status={status} serviceId={serviceId} />
          ) : (
            <SubmitWorkflowButton />
          )}
        </div>

        <WorkflowSettingPanel />
      </div>
    </ReactFlowProvider>
  );
};
