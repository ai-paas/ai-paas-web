import { useNavigate } from 'react-router';
import { BreadCrumb } from '@innogrid/ui';
import { WorkflowEditor } from '@/components/features/workflow/workflow-editor';
import styles from '../workflow.module.scss';

const initialNodes = [
  // ...Array.from({ length: 20 }, (_, rowIndex) => {
  //   const rowChar = String.fromCharCode(97 + rowIndex);
  //   return Array.from({ length: 10 }, (_, colIndex) => {
  //     const id = `${rowChar}${colIndex + 1}`;
  //     let type = 'end';
  //     let label = '답변';
  //     if (colIndex % 4 === 0) {
  //       type = 'START';
  //       label = '시작';
  //     } else if (colIndex % 4 === 1) {
  //       type = 'MODEL';
  //       label = '모델';
  //     } else if (colIndex % 4 === 2) {
  //       type = 'KNOWLEDGE_BASE';
  //       label = '지식베이스';
  //     } else if (colIndex % 4 === 3) {
  //       type = 'END';
  //       label = '끝';
  //     }
  //     return {
  //       id: id,
  //       position: { x: colIndex * 150, y: 100 + rowIndex * 50 },
  //       data: { label: label },
  //       type: type,
  //     };
  //   });
  // }).flat(),
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
  },
  {
    id: 'e2-3',
    source: 'n2',
    target: 'n3',
  },
];

export default function WorkflowCreatePage() {
  const navigate = useNavigate();

  const handleChecklist = () => {
    alert('체크리스트 버튼이 클릭되었습니다.');
  };

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '워크플로우', path: '/workflow' }, { label: '워크플로우 생성' }]}
          onNavigate={navigate}
        />
      </div>
      <div className={styles.container}>
        <WorkflowEditor initialNodes={[]} initialEdges={[]} />
      </div>
    </main>
  );
}
