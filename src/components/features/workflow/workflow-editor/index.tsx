import { ReactFlowProvider, type Edge } from '@xyflow/react';
import { WorkflowComponentPanel } from './workflow-component-panel';
import { FlowChart } from '@/components/ui/flow-chart';
import { Button } from '@innogrid/ui';
import { SubmitWorkflowButton } from './submit-workflow-button';
import { WorkflowSettingPanel } from './workflow-setting-panel';
import styles from '@/pages/workflow/workflow.module.scss';
import type { WorkflowNode } from '@/store/useWorkflowStore';

interface WorkflowEditorProps {
  initialNodes: WorkflowNode[];
  initialEdges: Edge[];
}

export const WorkflowEditor = ({ initialNodes, initialEdges }: WorkflowEditorProps) => {
  const handleChecklist = () => {};

  return (
    <ReactFlowProvider>
      <WorkflowComponentPanel />

      <div className={styles.contentBox}>
        <div className="size-full">
          <FlowChart initialNodes={initialNodes} initialEdges={initialEdges} />
        </div>

        <div className="absolute top-5 right-5 flex gap-1.5">
          <Button onClick={handleChecklist} size="medium" color="tertiary">
            체크리스트
          </Button>
          <SubmitWorkflowButton />
        </div>

        <WorkflowSettingPanel />
      </div>
    </ReactFlowProvider>
  );
};
