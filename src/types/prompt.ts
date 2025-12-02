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
  name: string;
  description: string;
  content: string;
  prompt_variable: string[];
}
