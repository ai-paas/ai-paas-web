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

export const CreateWorkflowButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pagination, setPagination } = useTablePagination();
  const navigate = useNavigate();

  return (
    <>
      <SelectButton title="생성" color="focus">
        <SelectButtonItem
          onClick={() => {
            navigate('/workflow/create');
          }}
        >
          직접 생성
        </SelectButtonItem>
        <SelectButtonItem onClick={() => setIsOpen(true)}>템플릿에서 시작</SelectButtonItem>
      </SelectButton>
      <Modal
        allowOutsideInteraction
        isOpen={isOpen}
        title="템플릿에서 시작하기"
        size="medium"
        onRequestClose={() => setIsOpen(false)}
        action={() => alert('확인!')}
        buttonTitle="확인"
        subButton={
          <Button size="large" color="secondary" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        }
      >
        <div className={styles.modalBox}>
          <Table
            usePagination={false}
            columns={columns}
            data={data}
            totalCount={data.length}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </Modal>
    </>
  );
};

const columns = [
  {
    id: 'name',
    header: '이름',
    accessorFn: (row) => row.name,
    size: 210,
  },
  {
    id: 'category',
    header: '카테고리',
    accessorFn: (row) => row.category,
    size: 210,
  },
  {
    id: 'description',
    header: '설명',
    accessorFn: (row) => row.description,
    size: 210,
  },
];

const data = [
  {
    name: 'automated email reply',
    category: '채팅',
    description: '설명이 들어갑니다.',
  },
];
