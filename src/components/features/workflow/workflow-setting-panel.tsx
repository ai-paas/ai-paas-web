import { useState } from 'react';
import { type Node, useOnSelectionChange, useReactFlow } from '@xyflow/react';
import { StartSetting } from './start-setting';
import { ModelSetting } from './model-setting';
import { KnowledgeBaseSetting } from './knowledge-setting';
import { EndSetting } from './end-setting';
import styles from '../../../pages/workflow/workflow.module.scss';

export const WorkflowSettingPanel = () => {
  const { setNodes, getNodes } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | undefined>();

  const clearSelection = () => {
    const updatedNodes = getNodes().map((node) => ({
      ...node,
      selected: false,
    }));
    setNodes(updatedNodes);
  };

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const selected = nodes.find((node) => node.selected);
      setSelectedNode(selected);
    },
  });

  console.log(selectedNode);

  if (!selectedNode) return null;

  return (
    <div className="absolute top-[70px] right-5 bottom-8 w-[340px] rounded-lg bg-white py-[30px] shadow-[4px_8px_18px_0px_rgba(0,0,0,0.2)]">
      <button type="button" onClick={clearSelection} className={styles.btnClose}>
        <span>닫기</span>
      </button>

      {selectedNode.type === 'start' && <StartSetting />}
      {selectedNode.type === 'model' && <ModelSetting />}
      {selectedNode.type === 'knowledgebase' && <KnowledgeBaseSetting />}
      {selectedNode.type === 'end' && <EndSetting />}
    </div>
  );
};
