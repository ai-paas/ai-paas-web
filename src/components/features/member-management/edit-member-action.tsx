import { AlertDialog, Button } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUpdateMember } from '@/hooks/service/member';
import type { UpdateMemberRequest } from '@/types/member';

interface EditMemberActionProps {
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

export const EditMemberAction = ({ formData }: EditMemberActionProps) => {
  const navigate = useNavigate();
  const { updateMember, isPending } = useUpdateMember();

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenResult, setIsOpenResult] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resultNode, setResultNode] = useState<React.ReactNode>(null);

  const [errors, setErrors] = useState({
    name: '',
    memberId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
  });

  // 검증
  const handleSubmit = () => {
    let newErrors = {
      name: '',
      memberId: '',
      email: '',
      password: '',
      passwordConfirm: '',
      phone: '',
    };

    if (!formData.email || !formData.phone) {
      newErrors.name = '필수 항목을 입력해주세요.';
    }

    if (formData.email && !/^[a-zA-Z0-9]+@[a-zA-Z]+(\.[a-zA-Z]+)+$/.test(formData.email)) {
      newErrors.email = '이메일 형식이 올바르지 않습니다.';
    }

    // 비밀번호(선택)
    const willChangePassword = !!(formData.password || formData.passwordConfirm);
    if (willChangePassword) {
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,16}$/.test(
          formData.password
        )
      ) {
        newErrors.password =
          '비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.';
      }
      if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);

    // 에러가 하나라도 있으면 중단
    const hasError = Object.values(newErrors).some((msg) => msg);
    if (hasError) return;

    // 통과 시 확인 모달 열기
    setIsOpenConfirm(true);
  };

  // 확인 클릭 시 API 호출
  const handleClickConfirm = () => {
    const willChangePassword = !!(formData.password || formData.passwordConfirm);

    const payload: UpdateMemberRequest = {
      name: formData.name,
      member_id: formData.memberId,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
      is_active: true,
      description: formData.description,
      ...(willChangePassword
        ? { password: formData.password, password_confirm: formData.passwordConfirm }
        : {}),
    };

    updateMember(payload, {
      onSuccess: () => {
        setIsSuccess(true);
        setResultNode('회원 수정이 완료되었습니다.');
        setIsOpenConfirm(false);
        setIsOpenResult(true);
      },
      onError: () => {
        setIsSuccess(false);
        setResultNode('회원 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setIsOpenConfirm(false);
        setIsOpenResult(true);
      },
    });
  };

  // 결과 모달 닫기
  const handleCloseResult = () => {
    setIsOpenResult(false);
    if (isSuccess) navigate(`/member-management/${formData.memberId}`);
  };

  return (
    <>
      {/* “수정” 버튼 → handleSubmit 실행 */}
      <Button size="large" color="primary" onClick={handleSubmit} disabled={isPending}>
        {isPending ? '처리 중...' : '수정'}
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
        <span>입력하신 정보로 회원 정보를 수정하시겠습니까?</span>
      </AlertDialog>

      {/* 결과 모달 */}
      <AlertDialog
        isOpen={isOpenResult}
        size="small"
        confirmButtonText="닫기"
        onClickConfirm={handleCloseResult}
        onClickClose={handleCloseResult}
      >
        {resultNode}
      </AlertDialog>
    </>
  );
};
