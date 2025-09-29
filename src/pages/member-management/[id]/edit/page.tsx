// src/pages/member-management/[id]/edit/page.tsx
import { BreadCrumb, Button, Input, Textarea, RadioButton } from '@innogrid/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { formatPhone } from '@/util/phone';
import { useGetMember, useUpdateMember } from '@/hooks/service/member';

interface MemberForm {
  name: string;
  memberId: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string; // raw 숫자만 저장
  role: string;
  description: string;
}

const memberIdRegex = /^[a-z0-9-]{5,45}$/;
const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+(\.[a-zA-Z]+)+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,16}$/;

export default function MemberEditPage() {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const { member: member } = useGetMember(paramId!);
  const { updateMember } = useUpdateMember();

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

  // 서버 데이터 → 폼 초기값 주입
  useEffect(() => {
    if (!member) return;
    const toDigits = (s: string) => (s || '').replace(/\D/g, '').slice(0, 11);
    setFormData({
      name: member.name ?? '',
      memberId: member.member_id ?? '', // 수정 화면에서는 보통 변경 불가
      email: member.email ?? '',
      password: '',
      passwordConfirm: '',
      phone: toDigits(member.phone ?? ''),
      role: member.role ?? 'user',
      description: member.description ?? '',
    });
    setErrors({ name: '', memberId: '', email: '', password: '', passwordConfirm: '' });
  }, [member]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // 유효성
      let errorMsg = '';
      if (name === 'name') {
        errorMsg = '이름은 한글만 입력 가능합니다.';
      }
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
      // 비번 바꿀 때 confirm 동기화
      if (name === 'password' && next.passwordConfirm && next.passwordConfirm !== value) {
        setErrors((p) => ({ ...p, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
      }
      if (name === 'password' && (!next.passwordConfirm || next.passwordConfirm === value)) {
        setErrors((p) => ({ ...p, passwordConfirm: '' }));
      }

      setErrors((p) => ({ ...p, [name]: errorMsg }));
      return next;
    });
  };

  const handleSubmit = () => {
    // 수정 페이지는 비밀번호 필수 아님 (입력했을 때만 검증/전송)
    const requiredMissing =
      !formData.name || !formData.memberId || !formData.email || !formData.phone;
    if (requiredMissing) {
      alert('필수 항목을 입력해주세요.');
      return;
    }
    if (!memberIdRegex.test(formData.memberId)) {
      alert("아이디는 소문자, 숫자, '-' 조합으로 5~45자여야 합니다.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert('이메일 형식이 올바르지 않습니다.');
      return;
    }

    // 비밀번호는 입력했을 때만 체크
    const willChangePassword = !!formData.password || !!formData.passwordConfirm;
    if (willChangePassword) {
      if (!passwordRegex.test(formData.password)) {
        alert('비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.');
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    // snake_case 매핑 (PATCH/PUT 본문)
    const basePayload = {
      name: formData.name,
      member_id: formData.memberId, // 서버 PK가 member_id(문자열)라면 그대로 보냄
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      is_active: true,
      description: formData.description,
    } as any;

    if (willChangePassword) {
      basePayload.password = formData.password;
      basePayload.password_confirm = formData.passwordConfirm;
    }

    updateMember(
      { memberId: formData.memberId, body: basePayload }, // ✅ /members/{id}/
      {
        onSuccess: () => {
          alert('회원 수정 완료!');
          navigate(`/member-management/${formData.memberId}`);
        },
        onError: (err) => {
          console.error(err);
          alert('회원 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
  };

  return (
    <main>
      <BreadCrumb
        items={[{ label: '멤버 관리', path: '/member-management' }, { label: '멤버 수정' }]}
        className="breadcrumbBox"
        onNavigate={navigate}
      />

      <div className="page-title-box">
        <h2 className="page-title">멤버 수정</h2>
      </div>

      <div className="page-content page-p-40">
        <div className="page-input-box">
          {/* 이름 */}
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

          {/* 아이디 (수정불가) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">아이디</div>
            <div className="page-input_item-data">
              <Input name="memberId" value={formData.memberId} readOnly disabled />
              {errors.memberId && <p className="page-input_item-input-desc">{errors.memberId}</p>}
            </div>
          </div>

          {/* 이메일 */}
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

          {/* 비밀번호(선택) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">비밀번호 변경</div>
            <div className="page-input_item-data">
              <Input
                type="password"
                name="password"
                placeholder="새 비밀번호 (선택)"
                value={formData.password}
                onChange={onChange}
              />
              {errors.password && <p className="page-input_item-input-desc">{errors.password}</p>}
              <div className="page-input_item-data mt-2">
                <Input
                  type="password"
                  name="passwordConfirm"
                  placeholder="새 비밀번호 확인"
                  value={formData.passwordConfirm}
                  onChange={onChange}
                />
                {errors.passwordConfirm && (
                  <p className="page-input_item-input-desc">{errors.passwordConfirm}</p>
                )}
              </div>
            </div>
          </div>

          {/* 연락처 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">연락처</div>
            <div className="page-input_item-data">
              <Input
                name="phone"
                placeholder="숫자만 입력해주세요."
                value={formatPhone(formData.phone)}
                onChange={onChange}
              />
            </div>
          </div>

          {/* 역할 */}
          <div className="page-input_item-box">
            <div className="page-input_item-name page-icon-requisite">역할</div>
            <div className="page-input_item_round-data">
              <div className="py-2">
                <RadioButton
                  id="radio-user"
                  label="사용자"
                  value="user"
                  checked={formData.role === 'user'}
                  onCheckedChange={() => setFormData((p) => ({ ...p, role: 'user' }))}
                />
              </div>
              <RadioButton
                id="radio-admin"
                label="관리자"
                value="admin"
                checked={formData.role === 'admin'}
                onCheckedChange={() => setFormData((p) => ({ ...p, role: 'admin' }))}
              />
            </div>
          </div>

          {/* 설명 */}
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
            <Button size="large" color="secondary" onClick={() => navigate(-1)}>
              취소
            </Button>
            <Button size="large" color="primary" onClick={handleSubmit}>
              수정
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
