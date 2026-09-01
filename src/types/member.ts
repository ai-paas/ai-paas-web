export interface Member {
  id: number;
  name: string;
  member_id: string;
  email: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  description?: string | null;
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
  phone?: string | null;
  role?: string;
  is_active?: boolean;
  description?: string | null;
  password: string;
  password_confirm: string;
}

export interface UpdateMemberRequest {
  name?: string | null;
  member_id?: string | null;
  email?: string | null;
  password?: string | null;
  phone?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  description?: string | null;
}

export type UpdateMemberPayload = Omit<UpdateMemberRequest, 'member_id'> & { member_id: string };
