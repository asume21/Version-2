import { apiRequest } from "./queryClient";

export interface CodeTranslationRequest {
  sourceCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  userId?: string;
  aiProvider?: "gemini" | "grok";
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
  aiProvider?: "gemini" | "grok";
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
  aiProvider?: "gemini" | "grok";
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
  aiProvider?: "gemini" | "grok";
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
