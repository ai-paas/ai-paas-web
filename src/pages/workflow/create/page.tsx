import { useNavigate } from "react-router";
import { BreadCrumb, Button } from "@innogrid/ui";
import { WorkflowSettingPanel } from "../../../components/features/workflow/workflow-setting-panel";
import { WorkflowComponentPanel } from "../../../components/features/workflow/workflow-component-panel";
import styles from "../workflow.module.scss";
import { WorkflowEditor } from "@/components/features/workflow/workflow-editor";
import { ReactFlowProvider } from "@xyflow/react";

const initialNodes = [
  {
    id: "n1",
    position: { x: 0, y: 100 },
    data: { label: "시작" },
    type: "start",
  },
  {
    id: "n2",
    position: { x: 400, y: 100 },
    data: { label: "모델" },
    type: "model",
  },
  {
    id: "n3",
    position: { x: 800, y: 100 },
    data: { label: "답변" },
    type: "end",
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "n1",
    target: "n2",
  },
  {
    id: "e2-3",
    source: "n2",
    target: "n3",
  },
];

export default function WorkflowCreatePage() {
  const navigate = useNavigate();

  return (
    <main>
      <BreadCrumb
        items={[
          { label: "워크플로우", path: "/workflow" },
          { label: "워크플로우 생성" },
        ]}
        onNavigate={navigate}
        className="breadcrumbBox"
      />
      <div className={styles.container}>
        <ReactFlowProvider>
          <WorkflowComponentPanel />

          <div className={styles.contentBox}>
            <WorkflowEditor
              initialNodes={initialNodes}
              initialEdges={initialEdges}
            />

            <div className="absolute top-5 right-5 flex gap-1.5">
              <Button
                onClick={() => alert("Button clicked!")}
                size="medium"
                color="tertiary"
              >
                체크리스트
              </Button>
              <Button
                onClick={() => alert("Button clicked!")}
                size="medium"
                color="primary"
              >
                생성
              </Button>
            </div>

            <WorkflowSettingPanel />
          </div>
        </ReactFlowProvider>
      </div>
    </main>
  );
}
