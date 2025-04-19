
export interface AiResponseOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
