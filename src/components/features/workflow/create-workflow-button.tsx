import {
  Button,
  CellCheckbox,
  HeaderCheckbox,
  Modal,
  SelectButton,
  SelectButtonItem,
  Table,
  useTablePagination,
  useTableSelection,
} from '@innogrid/ui';
import { useMemo, useState } from 'react';
import styles from '../../../pages/service/service.module.scss';
import { useNavigate } from 'react-router';
import { useGetTemplates } from '@/hooks/service/workflows';
import type { WorkflowTemplateBrief } from '@/types/workflow';

export const CreateWorkflowButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pagination, setPagination } = useTablePagination();
  const { rowSelection, setRowSelection } = useTableSelection();
  const { workflowTemplates, isPending, isError } = useGetTemplates();
  const navigate = useNavigate();

  const selectedTemplate = useMemo(() => {
    const selectedRowKeys = Object.keys(rowSelection);
    if (selectedRowKeys.length !== 1) return;

    return workflowTemplates[parseInt(selectedRowKeys[0])];
  }, [rowSelection, workflowTemplates]);
  const selectedTemplateId = selectedTemplate?.id;
  const canStart = !!selectedTemplateId;

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
    if (!canStart || !selectedTemplateId) return;

    const params = new URLSearchParams({
      templateId: String(selectedTemplateId),
    });

    setIsOpen(false);
    setRowSelection({});
    navigate(`/workflow/workflow/create?${params.toString()}`);
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
        buttonDisabled={!canStart}
        title="템플릿에서 시작하기"
        size="medium"
        onRequestClose={() => {
          setIsOpen(false);
          setRowSelection({});
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
            }}
          >
            취소
          </Button>
        }
      >
        <div className={styles.modalBox}>
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
