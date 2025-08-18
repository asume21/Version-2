import { apiRequest } from "./queryClient";

export interface CodeTranslationRequest {
  sourceCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId?: string;
  aiProvider?: "openai" | "grok" | "gemini";
}

export interface CodeTranslationResponse {
  translatedCode: string;
  explanation: string;
  id?: string;
}

export interface LyricsRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  userId?: string;
  aiProvider?: "openai" | "grok" | "gemini";
}

export interface LyricsResponse {
  lyrics: string;
  rhymeScheme: string;
  sentiment: string;
  id?: string;
}

export interface LyricsAnalysisRequest {
  lyrics: string;
}

export interface LyricsAnalysisResponse {
  sentiment: string;
  themes: string[];
  rhymeScheme: string;
  complexity: number;
}

export interface BeatRequest {
  genre: string;
  bpm: number;
  duration: number;
  userId?: string;
  aiProvider?: "openai" | "grok" | "gemini";
}

export interface BeatResponse {
  pattern: number[];
  samples: string[];
  description: string;
  id?: string;
}

export interface CodeBeatRequest {
  code: string;
  language: string;
  userId?: string;
  aiProvider?: "openai" | "gemini" | "grok";
}

export interface CodeBeatResponse {
  melody: number[];
  rhythm: number[];
  key: string;
  tempo: number;
  description: string;
  id?: string;
}

export interface AIAssistRequest {
  question: string;
  context?: string;
  aiProvider?: "openai" | "grok" | "gemini";
}

export interface AIAssistResponse {
  answer: string;
  suggestions: string[];
}

export const codeAPI = {
  translate: async (data: CodeTranslationRequest): Promise<CodeTranslationResponse> => {
    const response = await apiRequest("POST", "/api/code/translate", data);
    return response.json();
  }
};

export const lyricsAPI = {
  generate: async (data: LyricsRequest): Promise<LyricsResponse> => {
    const response = await apiRequest("POST", "/api/lyrics/generate", data);
    return response.json();
  },

  analyze: async (data: LyricsAnalysisRequest): Promise<LyricsAnalysisResponse> => {
    const response = await apiRequest("POST", "/api/lyrics/analyze", data);
    return response.json();
  }
};

export const beatAPI = {
  generate: async (data: BeatRequest): Promise<BeatResponse> => {
    const response = await apiRequest("POST", "/api/beat/generate", data);
    return response.json();
  }
};

export const codeBeatAPI = {
  convert: async (data: CodeBeatRequest): Promise<CodeBeatResponse> => {
    const response = await apiRequest("POST", "/api/codebeat/convert", data);
    return response.json();
  }
};

export const aiAPI = {
  assist: async (data: AIAssistRequest): Promise<AIAssistResponse> => {
    const response = await apiRequest("POST", "/api/ai/assist", data);
    return response.json();
  }
};

// Billing
export interface BillingPlan {
  id: string;
  nickname: string;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  productId: string;
}

export const billingAPI = {
  getPlans: async (): Promise<{ enabled: boolean; plans: BillingPlan[] }> => {
    const res = await apiRequest("GET", "/api/billing/plans");
    return res.json();
  },
  getStatus: async (params: { email?: string; customerId?: string }): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.email) qs.set("email", params.email);
    if (params.customerId) qs.set("customerId", params.customerId);
    const res = await apiRequest("GET", `/api/billing/status?${qs.toString()}`);
    return res.json();
  },
  createCheckoutSession: async (data: { priceId: string; email?: string; successUrl: string; cancelUrl: string }): Promise<{ url: string }> => {
    const res = await apiRequest("POST", "/api/billing/create-checkout-session", data);
    return res.json();
  },
  createPortalSession: async (data: { customerId?: string; email?: string; returnUrl: string }): Promise<{ url: string }> => {
    const res = await apiRequest("POST", "/api/billing/create-portal-session", data);
    return res.json();
  }
};
