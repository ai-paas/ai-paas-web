export interface Prompt {
  id: number;
  surro_prompt_id: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  name: string;
  description: string;
  content: string;
  prompt_variable: {
    id: number;
    name: string;
    prompt_id: number;
  }[];
}

export interface PromptVariableTypeList {
  /** 프롬프트에서 사용할 수 있는 변수 타입 목록 */
  available_types: string[];
}

export interface CreatePromptRequest {
  prompt: {
    name: string;
    description: string;
    content: string;
  };
  prompt_variable: string[];
}

export interface UpdatePromptRequest {
  surro_prompt_id: number;
  name?: string;
  description?: string;
  content?: string;
  prompt_variable?: string[];
}
