import { apiClient } from "@/app/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AiInsightSummary {
  income: number;
  expense: number;
  savings: number;
}

export interface TopCategory {
  name: string;
  amount: number;
}

export interface AiCoachResponse {
  message: string;
  data: {
    summary: AiInsightSummary;
    score: number;
    insights: string[];
    topCategory: TopCategory | null;
  };
}

export interface AiChatRequest {
  message: string;
  mode?: "friendly" | "strict" | "investor";
}

export interface AiChatResponse {
  message: string;
  reply: string;
}

export interface VoiceChatRequest {
  message: string;
  mode?: "friendly" | "strict" | "investor";
}

export interface VoiceChatResponse {
  success: boolean;
  reply: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const aiCoachApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    // GET /ai/ai-coach  — financial insights + score (no auth guard on backend,
    // but we still send the JWT so req.user is populated via passport)
    getAiCoach: builder.query<AiCoachResponse, void>({
      query: () => ({
        url: "/ai/ai-coach",
        method: "GET",
      }),
    }),

    // POST /ai/chat  — protected, requires JWT
    aiChat: builder.mutation<AiChatResponse, AiChatRequest>({
      query: (body) => ({
        url: "/ai/chat",
        method: "POST",
        body,
      }),
    }),

    // POST /ai/voice  — protected, requires JWT
    voiceChat: builder.mutation<VoiceChatResponse, VoiceChatRequest>({
      query: (body) => ({
        url: "/ai/voice",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAiCoachQuery,
  useAiChatMutation,
  useVoiceChatMutation,
} = aiCoachApi;