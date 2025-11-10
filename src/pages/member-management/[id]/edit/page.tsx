import { BreadCrumb, Button, Input, Textarea, RadioButton } from '@innogrid/ui';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { formatPhone } from '@/util/phone';
import { useGetMember } from '@/hooks/service/member';
import { EditMemberAction } from '@/components/features/member-management/edit-member-action';

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

export default function MemberEditPage() {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const { member: member } = useGetMember(paramId!);

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

    // 연락처는 숫자만 보관
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }

    // 그 외 필드들은 단순 업데이트만
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          {/* 이름 (수정불가) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">이름</div>
            <div className="page-input_item-data">
              <Input
                name="name"
                placeholder="이름을 입력해주세요."
                value={formData.name}
                onChange={onChange}
                readOnly
                disabled
              />
              {errors.name && <p className="page-input_item-input-desc">{errors.name}</p>}
            </div>
          </div>

          {/* 아이디 (수정불가) */}
          <div className="page-input_item-box">
            <div className="page-input_item-name">아이디</div>
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
            <EditMemberAction formData={formData} />
          </div>
        </div>
      </div>
    </main>
  );
}
