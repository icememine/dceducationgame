import type Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, glossary, library, searchLibrary } from "@content/library";
import { fundFactsText } from "@content/library/fund-facts-text";
import { GUARDRAIL_PROMPT } from "./guardrails";
import { voiceFor, type Voice } from "./voice";

/**
 * Hỏi Rồng: answers investor questions from the Q&A library.
 *
 * The whole library (≈200 Q&As, fund facts, glossary) goes into the system prompt rather
 * than a top-k retrieval: it is small enough, keyword retrieval misses paraphrases, and the
 * block is identical for every request, so prompt caching makes repeat questions cheap.
 * Order matters for the cache: rules + voice first, then the library with the cache
 * breakpoint, then the conversation.
 */

export const RONG_CONFIG = {
  model: process.env.AI_MODEL ?? "claude-opus-5-5",
  /** Chat is latency-sensitive and answers are short; raise only if evals show it helps. */
  effort: "low" as const,
  /** Thinking is always on for this model, so leave room beyond the visible answer. */
  maxTokens: 8000,
  /** Earlier turns sent with each question. */
  historyTurns: 6,
  maxQuestionChars: 600,
};

export type ChatTurn = { role: "user" | "assistant"; text: string };

export function libraryText(): string {
  const qa = library.map((e) => `[${CATEGORIES[e.cat].title}] ${e.q}\n${e.a}`).join("\n\n");
  const terms = glossary.map((g) => `${g.term}${g.full ? ` (${g.full})` : ""}: ${g.def}`).join("\n");
  return `THƯ VIỆN HỎI ĐÁP (theo chủ đề):\n${qa}\n\nSỐ LIỆU QUỸ:\n${fundFactsText()}\n\nTHUẬT NGỮ:\n${terms}`;
}

/** Builds the Messages API request. Pure, so tests can check ordering and content. */
export function buildRongRequest(question: string, history: ChatTurn[], voice: Voice) {
  const intro = "Bạn là Rồng, trợ lý học tập của Rồng DC Academy, ứng dụng giáo dục đầu tư của Dragon Capital Việt Nam. Bạn trả lời câu hỏi của nhà đầu tư cá nhân.";
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: `${intro}\n\n${GUARDRAIL_PROMPT}\n\nHƯỚNG DẪN GIỌNG ĐIỆU:\n${voiceFor(voice, "rong")}` },
    { type: "text", text: libraryText(), cache_control: { type: "ephemeral" } },
  ];
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...history.slice(-RONG_CONFIG.historyTurns).map((t) => ({ role: t.role, content: t.text })),
    { role: "user", content: question.slice(0, RONG_CONFIG.maxQuestionChars) },
  ];
  // The API needs the first message to be from the user.
  while (messages.length && messages[0].role !== "user") messages.shift();
  return {
    model: RONG_CONFIG.model,
    max_tokens: RONG_CONFIG.maxTokens,
    output_config: { effort: RONG_CONFIG.effort },
    // A declined request is re-run on Anthropic's recommended fallback model, server-side.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default" as const,
    system,
    messages,
  };
}

export const REFUSED_REPLY = "Rồng chưa trả lời được câu này. Anh/chị thử hỏi cách khác, hoặc liên hệ CSKH@dragoncapital.com để được hỗ trợ trực tiếp.";
export const NO_MATCH_REPLY = "Rồng chưa có thông tin cho câu này trong thư viện. Anh/chị có thể hỏi CSKH@dragoncapital.com (kèm mã lệnh nếu có, không gửi OTP hay PIN).";

/** Used when no API credentials are configured (local dev, demos): the closest library answer. */
export function offlineRongAnswer(question: string): string {
  const best = searchLibrary(question, 1)[0];
  if (!best) return NO_MATCH_REPLY;
  const advice = /nên (mua|chọn) quỹ nào|mua quỹ nào/iu.test(question) ? "Rồng không chọn quỹ thay anh/chị, nhưng đây là cách chọn: " : "";
  return `${advice}${best.a}`;
}

export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/**
 * Streams the answer as text chunks. Falls back to the library answer when the API is not
 * configured, and to a polite message when the request is declined.
 */
export async function* streamRongAnswer(question: string, history: ChatTurn[], voice: Voice): AsyncGenerator<string, { mode: "ai" | "offline"; model?: string }> {
  if (!aiConfigured()) {
    yield offlineRongAnswer(question);
    return { mode: "offline" };
  }
  const { default: AnthropicClient } = await import("@anthropic-ai/sdk");
  const client = new AnthropicClient();
  const stream = client.beta.messages.stream(buildRongRequest(question, history, voice));
  let wrote = false;
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      wrote = true;
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") yield (wrote ? "\n\n" : "") + REFUSED_REPLY;
  return { mode: "ai", model: final.model };
}
