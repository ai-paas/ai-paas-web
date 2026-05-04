import { ReactFlowProvider, type Edge } from '@xyflow/react';
import { WorkflowComponentPanel } from './workflow-component-panel';
import { FlowChart } from '@/components/ui/flow-chart';
import { ChecklistWorkflowButton } from './checklist-workflow-button';
import { SubmitWorkflowButton } from './submit-workflow-button';
import { WorkflowSettingPanel } from './workflow-setting-panel';
import styles from '@/pages/workflow/workflow.module.scss';
import type { WorkflowNode } from '@/store/useWorkflowStore';

interface WorkflowEditorProps {
  initialNodes: WorkflowNode[];
  initialEdges: Edge[];
}

export const WorkflowEditor = ({ initialNodes, initialEdges }: WorkflowEditorProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowComponentPanel />

      <div className={styles.contentBox}>
        <div className="size-full">
          <FlowChart initialNodes={initialNodes} initialEdges={initialEdges} />
        </div>

        <div className="absolute top-5 right-5 flex gap-1.5">
          <ChecklistWorkflowButton />
          <SubmitWorkflowButton />
        </div>

        <WorkflowSettingPanel />
      </div>
    </ReactFlowProvider>
  );
};
