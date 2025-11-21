---
name: workflow-canvas
description: XyFlow를 사용한 워크플로우 캔버스 기능을 개발합니다. 노드 기반 워크플로우 편집기, 드래그앤드롭 캔버스, 커스텀 노드 타입, 엣지 연결 등 비주얼 워크플로우 빌더를 구현할 때 사용하세요.
---

# Workflow Canvas Development Skill

XyFlow (React Flow) v12.8.3을 활용한 노드 기반 워크플로우 캔버스를 구축합니다.

## When to Use This Skill

- 워크플로우 캔버스 페이지를 새로 만들 때
- 커스텀 노드 타입을 추가할 때 (Start, Model, Knowledgebase, End 등)
- 드래그 앤 드롭으로 노드를 추가하는 기능이 필요할 때
- 노드 연결(Edge) 로직 및 검증이 필요할 때
- 노드 선택, 설정 패널, 저장/불러오기 기능을 구현할 때
- Undo/Redo, 자동 레이아웃 등 고급 기능을 추가할 때

## 기술 스택

- **그래프 라이브러리**: XyFlow v12.8.3 (@xyflow/react)
- **프레임워크**: React 18.3.1 + TypeScript
- **스타일링**: Tailwind CSS 4.1.11

## 프로젝트의 워크플로우 구조

AI-PaaS 플랫폼의 워크플로우는 다음 노드 타입으로 구성됩니다:

1. **Start Node** (시작): 파란색, 워크플로우 시작점
2. **Model Node** (모델): 보라색, LLM 모델 실행
3. **Knowledgebase Node** (지식베이스): 초록색, 지식 검색
4. **End Node** (답변): 주황색, 워크플로우 종료

## 기본 구조

### 1. React Flow Provider 설정

```typescript
// src/pages/workflow/create/page.tsx
import { ReactFlowProvider } from '@xyflow/react';

export default function WorkflowCreatePage() {
  return (
    <div>
      <ReactFlowProvider>
        <WorkflowEditor />
      </ReactFlowProvider>
    </div>
  );
}
```

### 2. 캔버스 컴포넌트

```typescript
// src/components/features/workflow/workflow-canvas.tsx
import { FlowChart } from '@/components/ui/flow-chart';
import { Handle, Position, type Edge, type Node } from '@xyflow/react';

const initialNodes: Node[] = [
  {
    id: 'n1',
    position: { x: 0, y: 100 },
    data: { label: '시작' },
    type: 'start',
  },
  {
    id: 'n2',
    position: { x: 400, y: 100 },
    data: { label: '모델' },
    type: 'model',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
  },
];

export const WorkflowCanvas = ({ initialNodes, initialEdges }) => {
  return (
    <div className="size-full">
      <FlowChart
        nodeTypes={{
          start: StartNode,
          model: ModelNode,
          knowledgebase: KnowledgebaseNode,
          end: EndNode,
        }}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </div>
  );
};
```

## 커스텀 노드 구현

### Start Node 예제

```typescript
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

const StartNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <div
        className={`flex rounded-2xl border-[2px] ${
          selected ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            {/* 아이콘 */}
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-blue-500 text-white shadow-md">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {/* SVG 아이콘 */}
              </svg>
            </div>

            {/* 라벨 */}
            <div className="mr-1 flex grow items-center truncate">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      {/* 우측 연결 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
```

### Model Node 예제 (양방향 연결)

```typescript
const ModelNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      {/* 좌측 입력 핸들 */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />

      <div
        className={`flex rounded-2xl border-[2px] ${
          selected ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            {/* 보라색 LLM 아이콘 */}
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-indigo-500 text-white shadow-md">
              {/* 아이콘 SVG */}
            </div>
            <div className="mr-1 flex grow items-center truncate">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      {/* 우측 출력 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
    </div>
  );
});

ModelNode.displayName = 'ModelNode';
```

### End Node 예제 (입력만)

```typescript
const EndNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      {/* 좌측 입력 핸들만 */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />

      <div
        className={`flex rounded-2xl border-[2px] ${
          selected ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            {/* 주황색 답변 아이콘 */}
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-amber-500 text-white shadow-md">
              {/* 아이콘 SVG */}
            </div>
            <div className="mr-1 flex grow items-center truncate">
              {data.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
```

## React Flow Hooks

### useReactFlow - 노드 및 엣지 제어

```typescript
import { useReactFlow } from '@xyflow/react';

function WorkflowEditor() {
  const { getNodes, getEdges, setNodes, setEdges, addNodes, addEdges } = useReactFlow();

  const handleSave = () => {
    const nodes = getNodes();
    const edges = getEdges();
    console.log('Saving workflow:', { nodes, edges });
  };

  const handleAddNode = () => {
    const newNode = {
      id: `n${Date.now()}`,
      position: { x: 200, y: 200 },
      data: { label: '새 노드' },
      type: 'model',
    };
    addNodes(newNode);
  };

  return (
    <div>
      <button onClick={handleSave}>저장</button>
      <button onClick={handleAddNode}>노드 추가</button>
    </div>
  );
}
```

### useNodesState & useEdgesState - 로컬 상태 관리

```typescript
import { useNodesState, useEdgesState } from '@xyflow/react';

function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
}
```

## 이벤트 핸들링

### 노드 이벤트

```typescript
import { ReactFlow } from '@xyflow/react';

function FlowCanvas() {
  const onNodeClick = (event, node) => {
    console.log('Node clicked:', node);
  };

  const onNodeDoubleClick = (event, node) => {
    console.log('Node double clicked:', node);
  };

  const onNodeDragStop = (event, node) => {
    console.log('Node dragged to:', node.position);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onNodeDoubleClick={onNodeDoubleClick}
      onNodeDragStop={onNodeDragStop}
    />
  );
}
```

### 엣지 이벤트

```typescript
const onEdgeClick = (event, edge) => {
  console.log('Edge clicked:', edge);
};

const onEdgeUpdate = (oldEdge, newConnection) => {
  setEdges((els) => updateEdge(oldEdge, newConnection, els));
};

return (
  <ReactFlow
    edges={edges}
    onEdgeClick={onEdgeClick}
    onEdgeUpdate={onEdgeUpdate}
  />
);
```

### 캔버스 이벤트

```typescript
const onPaneClick = (event) => {
  console.log('Canvas clicked');
};

const onSelectionChange = ({ nodes, edges }) => {
  console.log('Selected nodes:', nodes);
  console.log('Selected edges:', edges);
};

return (
  <ReactFlow
    onPaneClick={onPaneClick}
    onSelectionChange={onSelectionChange}
  />
);
```

## 드래그 앤 드롭 구현

### 노드 팔레트 (사이드바)

```typescript
function WorkflowComponentPanel() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="workflow-sidebar">
      <div
        onDragStart={(e) => onDragStart(e, 'model')}
        draggable
        className="node-item"
      >
        모델 노드
      </div>
      <div
        onDragStart={(e) => onDragStart(e, 'knowledgebase')}
        draggable
        className="node-item"
      >
        지식베이스 노드
      </div>
    </aside>
  );
}
```

### 드롭 존 (캔버스)

```typescript
import { useReactFlow } from '@xyflow/react';

function WorkflowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} 노드` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      onDrop={onDrop}
      onDragOver={onDragOver}
    />
  );
}
```

## 스타일링 및 설정

### 필수 CSS 임포트

```typescript
import '@xyflow/react/dist/style.css';
```

### 커스텀 스타일

```scss
// workflow.module.scss
.container {
  display: flex;
  height: calc(100vh - 80px);
}

.contentBox {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}

.react-flow__node {
  cursor: pointer;
}

.react-flow__edge {
  stroke: #296dff;
  stroke-width: 2;
}

.react-flow__edge.selected {
  stroke: #1e40af;
}

.react-flow__handle {
  width: 2px;
  height: 12px;
  border-radius: 1px;
}
```

### React Flow 설정

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  fitView
  minZoom={0.5}
  maxZoom={2}
  defaultEdgeOptions={{
    animated: true,
    style: { stroke: '#296dff', strokeWidth: 2 },
  }}
  connectionLineStyle={{ stroke: '#296dff', strokeWidth: 2 }}
  snapToGrid={true}
  snapGrid={[15, 15]}
>
  <Background variant="dots" gap={12} size={1} />
  <Controls />
  <MiniMap />
</ReactFlow>
```

## 고급 기능

### 1. 노드 검증 (연결 규칙)

```typescript
const isValidConnection = (connection) => {
  // Start 노드는 출력만 가능
  if (connection.sourceHandle && connection.source.startsWith('start')) {
    return true;
  }

  // End 노드는 입력만 가능
  if (connection.targetHandle && connection.target.startsWith('end')) {
    return true;
  }

  return false;
};

<ReactFlow isValidConnection={isValidConnection} />;
```

### 2. 자동 레이아웃 (Dagre)

```typescript
import dagre from 'dagre';

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 120,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
```

### 3. Undo/Redo 기능

```typescript
import { useCallback, useState } from 'react';

function useUndoRedo(initialNodes, initialEdges) {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [present, setPresent] = useState({ nodes: initialNodes, edges: initialEdges });

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [past, present, future]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setFuture(newFuture);
    setPresent(next);
  }, [past, present, future]);

  const setState = useCallback((newState) => {
    setPast([...past, present]);
    setPresent(newState);
    setFuture([]);
  }, [past, present]);

  return { present, undo, redo, setState, canUndo: past.length > 0, canRedo: future.length > 0 };
}
```

### 4. 노드 데이터 수정 (설정 패널)

```typescript
function WorkflowSettingPanel({ selectedNode }) {
  const { setNodes } = useReactFlow();

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  };

  if (!selectedNode) return null;

  return (
    <div className="settings-panel">
      <h3>노드 설정</h3>
      <Input
        label="레이블"
        value={selectedNode.data.label}
        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
      />
      {selectedNode.type === 'model' && (
        <Select
          label="모델 선택"
          value={selectedNode.data.modelId}
          onChange={(value) => updateNodeData(selectedNode.id, { modelId: value })}
        />
      )}
    </div>
  );
}
```

## TypeScript 타입 정의

```typescript
import type { Node, Edge, NodeProps } from '@xyflow/react';

// 노드 데이터 타입
interface StartNodeData {
  label: string;
}

interface ModelNodeData {
  label: string;
  modelId?: string;
  temperature?: number;
}

interface KnowledgebaseNodeData {
  label: string;
  knowledgeBaseId?: string;
}

interface EndNodeData {
  label: string;
}

// 노드 타입 정의
export type WorkflowNode =
  | Node<StartNodeData, 'start'>
  | Node<ModelNodeData, 'model'>
  | Node<KnowledgebaseNodeData, 'knowledgebase'>
  | Node<EndNodeData, 'end'>;

// 워크플로우 타입
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}
```

## 디버깅 팁

```typescript
// 노드/엣지 상태 로깅
useEffect(() => {
  console.log('Nodes:', nodes);
  console.log('Edges:', edges);
}, [nodes, edges]);

// React Flow 인스턴스 접근
const reactFlowInstance = useReactFlow();
console.log('Flow bounds:', reactFlowInstance.getViewport());
```

## 체크리스트

- [ ] ReactFlowProvider로 래핑
- [ ] 커스텀 노드 타입 정의 및 구현
- [ ] 노드 Handle 위치 및 스타일 설정
- [ ] 드래그 앤 드롭 구현
- [ ] 노드/엣지 이벤트 핸들러 추가
- [ ] 저장/불러오기 API 연동
- [ ] 노드 설정 패널 구현
- [ ] 연결 검증 로직 추가
- [ ] Undo/Redo 기능 (선택사항)
- [ ] 자동 레이아웃 (선택사항)
- [ ] TypeScript 타입 정의

## 참고 자료

- XyFlow 공식 문서: https://reactflow.dev/
- 예제: https://reactflow.dev/examples
