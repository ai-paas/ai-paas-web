import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreateMember } from '@/hooks/service/member';
import type { CreateMemberRequest } from '@/types/member';

interface CreateMemberActionProps {
  formData: {
    name: string;
    memberId: string;
    email: string;
    password: string;
    passwordConfirm: string;
    phone: string;
    role: string;
    description: string;
  };
}

export const CreateMemberAction = ({ formData }: CreateMemberActionProps) => {
  const navigate = useNavigate();
  const { createMember, isPending } = useCreateMember();

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultNode, setResultNode] = useState<React.ReactNode>(null);
  const [isOpenError, setIsOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ✅ 검증
  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.memberId ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setErrorMessage('필수 항목을 입력해주세요.');
      setIsOpenError(true);
      return;
    }
    if (!/^[가-힣]+$/.test(formData.name)) {
      setErrorMessage('이름은 한글만 입력 가능합니다.');
      setIsOpenError(true);
      return;
    }
    if (!/^[a-z0-9-]{5,45}$/.test(formData.memberId)) {
      setErrorMessage("아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.");
      setIsOpenError(true);
      return;
    }
    if (!/^[a-zA-Z0-9]+@[a-zA-Z]+(\.[a-zA-Z]+)+$/.test(formData.email)) {
      setErrorMessage('이메일 형식이 올바르지 않습니다.');
      setIsOpenError(true);
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,16}$/.test(
        formData.password
      )
    ) {
      setErrorMessage('비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.');
      setIsOpenError(true);
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      setIsOpenError(true);
      return;
    }
    if (!/^\d{10,11}$/.test(formData.phone)) {
      setErrorMessage('연락처는 숫자만 입력 가능하며 10~11자리여야 합니다.');
      setIsOpenError(true);
      return;
    }

    // ✅ 통과 시 확인 모달 열기
    setIsOpenConfirm(true);
  };

  const handleClickConfirm = () => {
    const payload: CreateMemberRequest = {
      name: formData.name,
      member_id: formData.memberId,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      is_active: true,
      description: formData.description,
      password: formData.password,
      password_confirm: formData.passwordConfirm,
    };

    createMember(payload, {
      onSuccess: (res) => {
        setIsSuccess(true);
        setResultNode(`회원 생성이 완료되었습니다. ID: ${res?.member_id ?? '—'}`);
        setIsOpenConfirm(false);
        setIsOpenResult(true);
      },
      onError: () => {
        setIsSuccess(false);
        setResultNode('회원 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setIsOpenConfirm(false);
        setIsOpenResult(true);
      },
    });
  };

  const handleCloseResult = () => {
    setIsOpenResult(false);
    if (isSuccess) navigate('/member-management');
  };

  return (
    <>
      {/* “생성” 버튼 → handleSubmit 실행 */}
      <Button size="large" color="primary" onClick={handleSubmit} disabled={isPending}>
        {isPending ? '처리 중...' : '생성'}
      </Button>

      {/* 확인 모달 */}
      <AlertDialog
        isOpen={isOpenConfirm}
        size="medium"
        confirmButtonText={isPending ? '처리 중...' : '확인'}
        cancelButtonText="취소"
        onClickConfirm={handleClickConfirm}
        onClickClose={() => !isPending && setIsOpenConfirm(false)}
      >
        <span>입력하신 정보로 회원을 생성하시겠습니까?</span>
      </AlertDialog>

      {/* 결과 모달 */}
      <AlertDialog
        isOpen={isOpenResult}
        size="medium"
        confirmButtonText="닫기"
        onClickConfirm={handleCloseResult}
        onClickClose={handleCloseResult}
      >
        {resultNode}
      </AlertDialog>
      {/* 에러 모달 */}
      <AlertDialog
        isOpen={isOpenError}
        size="small"
        confirmButtonText="확인"
        onClickConfirm={() => setIsOpenError(false)}
        onClickClose={() => setIsOpenError(false)}
      >
        {errorMessage}
      </AlertDialog>
    </>
  );
};
