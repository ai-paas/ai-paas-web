import {
  Button,
  Modal,
  SelectButton,
  SelectButtonItem,
  Table,
  useTablePagination,
} from '@innogrid/ui';
import { useState } from 'react';
import styles from '../../../pages/service/service.module.scss';
import { useNavigate } from 'react-router';
import { useGetTemplates } from '@/hooks/service/workflows';
import type { WorkflowTemplate } from '@/types/workflow';

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row: WorkflowTemplate) => row.name,
    size: 210,
  },
  {
    id: 'category',
    header: '카테고리',
    accessorFn: (row: WorkflowTemplate) => row.category,
    size: 210,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row: WorkflowTemplate) => row.description,
    size: 210,
  },
];

export const CreateWorkflowButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pagination, setPagination } = useTablePagination();
  const { workflowTemplates, isPending, isError } = useGetTemplates();
  const navigate = useNavigate();

  const handleAction = () => {
    alert('템플릿 생성 로직 추가 필요');
  };

  return (
    <>
      <SelectButton title="생성" color="focus">
        <SelectButtonItem onClick={() => navigate('/workflow/create')}>직접 생성</SelectButtonItem>
        <SelectButtonItem onClick={() => setIsOpen(true)}>템플릿에서 시작</SelectButtonItem>
      </SelectButton>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        title="템플릿에서 시작하기"
        size="medium"
        onRequestClose={() => setIsOpen(false)}
        action={handleAction}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        }
      >
        <div className={styles.modalBox}>
          <div className="h-40">
            <Table
              usePagination={false}
              columns={columns}
              data={workflowTemplates}
              isLoading={isPending}
              emptyMessage={
                isError
                  ? '템플릿 목록을 불러오는 데 실패했습니다.'
                  : '사용 가능한 템플릿이 없습니다.'
              }
              totalCount={workflowTemplates.length}
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
