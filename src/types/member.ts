export interface Member {
  id: number;
  name: string;
  member_id: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  description: string;
}

export interface GetMembersParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
}

export interface CreateMemberRequest {
  name: string;
  member_id: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  description: string;
  password: string;
  password_confirm: string;
}

export interface UpdateMemberRequest {
  memberId: string;
  body: {
    name: string;
    member_id: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    is_active: boolean;
    description: string;
  };
}
