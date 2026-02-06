export type AIProvider = "openai" | "anthropic";

export interface AISettings {
  provider: AIProvider;
  openaiKey: string;
  anthropicKey: string;
  openaiModel: string;
  anthropicModel: string;
}

export interface GenerateRequest {
  premise: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
}
