import { BreadCrumb, Button, Input, Textarea, RadioButton } from '@innogrid/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { formatPhone } from '@/util/phone';
import { useCreateMember } from '@/hooks/service/member';
import type { CreateMemberRequest } from '@/types/member';

interface MemberForm {
  name: string;
  memberId: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string; // raw 숫자만 저장 (표시는 formatPhone)
  role: string;
  description: string;
}

// member_id: 소문자, 숫자, '-' 허용, 5~45자
const memberIdRegex = /^[a-z0-9-]{5,45}$/;

const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+(\.[a-zA-Z]+)+$/; // 이메일 형식, 영어와 숫자 가능
// 8~16자, 대문자/소문자/숫자/특수문자 각 1개 이상
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,16}$/;

export default function MemberCreatePage() {
  const navigate = useNavigate();
  const { createMember } = useCreateMember();

  const [formData, setFormData] = useState<MemberForm>({
    name: '',
    memberId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    role: 'user',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    memberId: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  // input & textarea 공통 핸들러
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 1) 연락처: 숫자만 허용 + 최대 11자리, 상태에는 raw 숫자만 저장
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }

    // 2) 공통 업데이트
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // 3) 필드별 유효성 검사
      let errorMsg = '';
      if (name === 'memberId' && value && !memberIdRegex.test(value)) {
        errorMsg = "아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.";
      }
      if (name === 'email' && value && !emailRegex.test(value)) {
        errorMsg = '이메일 형식이 올바르지 않습니다.';
      }
      if (name === 'password' && value && !passwordRegex.test(value)) {
        errorMsg = '비밀번호는 8~16자, 영문 대/소문자·숫자·특수문자를 모두 포함해야 합니다.';
      }
      if (name === 'passwordConfirm' && value && value !== next.password) {
        errorMsg = '비밀번호가 일치하지 않습니다.';
      }
      // 비밀번호를 바꿀 때도 비밀번호 확인 에러를 즉시 갱신
      if (name === 'password' && next.passwordConfirm && next.passwordConfirm !== value) {
        setErrors((prevErr) => ({ ...prevErr, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
      }
      if (name === 'password' && (!next.passwordConfirm || next.passwordConfirm === value)) {
        setErrors((prevErr) => ({ ...prevErr, passwordConfirm: '' }));
      }

      setErrors((prevErr) => ({ ...prevErr, [name]: errorMsg }));
      return next;
    });
  };

  const handleSubmit = () => {
    // 필수값/형식 최종 체크 (사용자가 blur/change 안 했어도 한 번 더)
    const requiredMissing =
      !formData.name ||
      !formData.memberId ||
      !formData.email ||
      !formData.password ||
      !formData.phone;
    if (requiredMissing) {
      alert('필수 항목을 입력해주세요.');
      return;
    }
    if (!memberIdRegex.test(formData.memberId)) {
      alert('아이디는 영어와 숫자만 입력 가능합니다.');
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert('이메일 형식이 올바르지 않습니다.');
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      alert('비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 프론트 -> 서버 DTO 매핑 (snake_case)
    const payload = {
      name: formData.name,
      member_id: formData.memberId,
      email: formData.email,
      phone: formData.phone, // formData.phone은 raw 숫자만 저장 중
      role: formData.role,
      is_active: true, // 기본 활성화 (요구 사항에 맞게 조정)
      description: formData.description,
      password: formData.password,
      password_confirm: formData.passwordConfirm,
    } satisfies CreateMemberRequest;

    createMember(payload, {
      onSuccess: () => {
        alert('회원 생성 완료!');
        navigate('/member-management');
      },
      onError: (err: unknown) => {
        console.error(err);
        alert('회원 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '멤버 관리', path: '/member-management' }, { label: '멤버 생성' }]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />
      <div className="page-title-box">
        <h2 className="page-title">멤버 생성</h2>
      </div>
      <div className="page-content page-p-40">
        <div className="page-input-box">
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이름</div>
            <div className="page-input_item-data">
              <Input
                name="name"
                placeholder="이름을 입력해주세요."
                value={formData.name}
                onChange={onChange}
              />
              {errors.name && <p className="page-input_item-input-desc">{errors.name}</p>}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">아이디</div>
            <div className="page-input_item-data">
              <Input
                name="memberId"
                placeholder="ID를 입력해주세요."
                value={formData.memberId}
                onChange={onChange}
              />
              {errors.memberId && <p className="page-input_item-input-desc">{errors.memberId}</p>}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">이메일</div>
            <div className="page-input_item-data">
              <Input
                name="email"
                placeholder="email을 입력해주세요."
                value={formData.email}
                onChange={onChange}
              />
              {errors.email && <p className="page-input_item-input-desc">{errors.email}</p>}
            </div>
          </div>
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">비밀번호</div>
            <div className="page-input_item-data">
              <Input
                type="password"
                name="password"
                placeholder="비밀번호를 입력해주세요."
                value={formData.password}
                onChange={onChange}
              />
              {errors.password && <p className="page-input_item-input-desc">{errors.password}</p>}
              <div className="page-input_item-data mt-2">
                <Input
                  type="password"
                  name="passwordConfirm"
                  placeholder="비밀번호를 한 번 더 입력해주세요."
                  value={formData.passwordConfirm}
                  onChange={onChange}
                />
                {errors.passwordConfirm && (
                  <p className="page-input_item-input-desc">{errors.passwordConfirm}</p>
                )}
              </div>
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">연락처</div>
            <div className="page-input_item-data">
              <Input
                name="phone"
                placeholder="숫자만 입력해주세요."
                // formData.phone은 raw 숫자, 화면에는 formatPhone으로 가공해서 표시
                value={formatPhone(formData.phone)}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">역할</div>
            <div className="page-input_item_round-data">
              <div className="py-2">
                <RadioButton
                  id="radio-user"
                  label="사용자"
                  value="user"
                  checked={formData.role === 'user'}
                  onCheckedChange={() => setFormData((prev) => ({ ...prev, role: 'user' }))}
                />
              </div>
              <RadioButton
                id="radio-admin"
                label="관리자"
                value="admin"
                checked={formData.role === 'admin'}
                onCheckedChange={() => setFormData((prev) => ({ ...prev, role: 'admin' }))}
              />
            </div>
          </div>

          <div className="page-input_item-box">
            <div className="page-input_item-name">설명</div>
            <div className="page-input_item-data">
              <Textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="설명을 입력해주세요."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="page-footer">
        <div className="page-footer_btn-box">
          <div />
          <div>
            <Button size="large" color="secondary" onClick={() => navigate('/member-management')}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={handleSubmit}>
              생성
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
