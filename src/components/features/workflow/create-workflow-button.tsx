import {
  Button,
  CellCheckbox,
  HeaderCheckbox,
  Input,
  Modal,
  SelectButton,
  SelectButtonItem,
  Table,
  useTablePagination,
  useTableSelection,
  useToast,
} from '@innogrid/ui';
import { useMemo, useState } from 'react';
import styles from '../../../pages/service/service.module.scss';
import { useNavigate } from 'react-router';
import { useCloneWorkflowTemplate, useGetTemplates } from '@/hooks/service/workflows';
import type { WorkflowTemplateBrief } from '@/types/workflow';

export const CreateWorkflowButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { workflowTemplates, isPending, isError } = useGetTemplates();
  const { cloneWorkflowTemplate, isPending: isClonePending } = useCloneWorkflowTemplate();
  const navigate = useNavigate();
  const toast = useToast();

  const selectedTemplate = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);
    if (selectedRowKeys.length !== 1) return;

    return workflowTemplates[parseInt(selectedRowKeys[0])];
  }, [rowSelection, workflowTemplates]);
  const selectedTemplateId = selectedTemplate?.id;
  const canClone = !!selectedTemplateId && workflowName.trim().length > 0 && !isClonePending;

  const columns = useMemo(
    () => [
      {
        id: 'select',
        size: 30,
        header: ({ table }: { table: WorkflowTemplateBrief }) => <HeaderCheckbox table={table} />,
        cell: ({ row }: { row: { original: WorkflowTemplateBrief } }) => <CellCheckbox row={row} />,
        enableSorting: false,
      },
      {
        id: 'name',
        header: '이름',
        accessorFn: (row: WorkflowTemplateBrief) => row.name,
        size: 180,
      },
      {
        id: 'category',
        header: '카테고리',
        accessorFn: (row: WorkflowTemplateBrief) => row.category,
        size: 160,
      },
      {
        id: 'description',
        header: '설명',
        accessorFn: (row: WorkflowTemplateBrief) => row.description,
        size: 200,
      },
    ],
    []
  );

  const handleAction = () => {
    if (!canClone || !selectedTemplateId) return;

    cloneWorkflowTemplate(
      {
        templateId: selectedTemplateId,
        workflow_name: workflowName.trim(),
      },
      {
        onSuccess: () => {
          toast.open({
            status: 'positive',
            title: '워크플로우 생성 성공',
            children: '템플릿으로 워크플로우가 성공적으로 생성되었습니다.',
          });
          setIsOpen(false);
          setRowSelection({});
          setWorkflowName('');
          navigate('/workflow/workflow');
        },
        onError: () => {
          toast.open({
            status: 'negative',
            title: '워크플로우 생성 실패',
            children: '템플릿으로 워크플로우를 생성하는 중 오류가 발생했습니다.',
          });
        },
      }
    );
  };

  return (
    <>
      <SelectButton title="생성" color="focus">
        <SelectButtonItem onClick={() => navigate('/workflow/workflow/create')}>
          직접 생성
        </SelectButtonItem>
        <SelectButtonItem onClick={() => setIsOpen(true)}>템플릿에서 시작</SelectButtonItem>
      </SelectButton>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        isButtonLoading={isClonePending}
        buttonDisabled={!canClone}
        title="템플릿에서 시작하기"
        size="medium"
        onRequestClose={() => {
          setIsOpen(false);
          setRowSelection({});
          setWorkflowName('');
        }}
        action={handleAction}
        buttonTitle="확인"
        subButton={
          <Button
            size="large"
            color="secondary"
            onClick={() => {
              setIsOpen(false);
              setRowSelection({});
              setWorkflowName('');
            }}
          >
            취소
          </Button>
        }
      >
        <div className={styles.modalBox}>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">워크플로우 이름</div>
            <div className="page-input_item-data">
              <Input
                placeholder="워크플로우 이름을 입력해주세요."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="page-input_item-name page-icon-requisite">템플릿</div>
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
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
