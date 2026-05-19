import { StartSetting } from './start-setting';
import { ModelSetting } from './model-setting';
import { KnowledgeBaseSetting } from './knowledge-setting';
import { EndSetting } from './end-setting';
import styles from '@/pages/workflow/workflow.module.scss';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export const WorkflowSettingPanel = () => {
  const selectedNode = useWorkflowStore((s) =>
    s.nodes.find((node) => node.id === s.selectedNodeId)
  );
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const clearSelection = () => selectNode(null);

  if (!selectedNode) return null;

  return (
    <div className="absolute top-[70px] right-5 bottom-8 w-[340px] rounded-lg bg-white py-[30px] shadow-[4px_8px_18px_0px_rgba(0,0,0,0.2)]">
      <button type="button" onClick={clearSelection} className={styles.btnClose}>
        <span>닫기</span>
      </button>

      {selectedNode.type === 'START' && <StartSetting />}
      {selectedNode.type === 'MODEL' && <ModelSetting />}
      {selectedNode.type === 'KNOWLEDGE_BASE' && <KnowledgeBaseSetting />}
      {selectedNode.type === 'END' && <EndSetting />}
    </div>
  );
};
