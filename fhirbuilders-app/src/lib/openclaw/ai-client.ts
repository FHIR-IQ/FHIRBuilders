/**
 * AI Client Factory
 *
 * Creates an AI client compatible with the OpenClaw code generator.
 * Supports Anthropic (Claude) and OpenAI (GPT-4o / Codex) via BYOK.
 * The returned object duck-types the Anthropic SDK's messages.create() interface.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIProvider = "anthropic" | "openai";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICreateParams {
  model: string;
  max_tokens: number;
  messages: AIMessage[];
}

export interface AIResponse {
  content: Array<{ type: "text"; text: string }>;
}

export interface AIClient {
  messages: {
    create(params: AICreateParams): Promise<AIResponse>;
  };
}

/**
 * Returns an Anthropic or OpenAI client that both satisfy the AIClient interface.
 * For OpenAI, maps the response shape to match Anthropic's content array format.
 */
export function createAIClient(provider: AIProvider, apiKey: string): AIClient {
  if (provider === "openai") {
    const openai = new OpenAI({ apiKey });
    return {
      messages: {
        async create(params: AICreateParams): Promise<AIResponse> {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: params.max_tokens,
            messages: params.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });
          const text = completion.choices[0]?.message?.content ?? "";
          return { content: [{ type: "text", text }] };
        },
      },
    };
  }

  // Default: Anthropic
  const anthropic = new Anthropic({ apiKey });
  return {
    messages: {
      async create(params: AICreateParams): Promise<AIResponse> {
        const response = await anthropic.messages.create({
          model: params.model,
          max_tokens: params.max_tokens,
          messages: params.messages,
        });
        const block = response.content[0];
        const text = block.type === "text" ? block.text : "";
        return { content: [{ type: "text", text }] };
      },
    },
  };
}

/** Validates an API key format without making a network call. */
export function validateApiKeyFormat(provider: AIProvider, key: string): string | null {
  if (!key.trim()) return "API key is required";
  if (provider === "anthropic" && !key.startsWith("sk-ant-")) {
    return "Anthropic API keys start with sk-ant-";
  }
  if (provider === "openai" && !key.startsWith("sk-")) {
    return "OpenAI API keys start with sk-";
  }
  return null;
}
