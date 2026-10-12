import { z } from "zod";
import { logAiMessage } from "@/db/queries";
import { reviewReply } from "@/features/ai/guardrails";
import { RONG_CONFIG, streamRongAnswer } from "@/features/ai/rong";
import { loadVoice } from "@/features/ai/voice-file";
import { getUserId } from "@/lib/auth";

const body = z.object({
  question: z.string().trim().min(1).max(RONG_CONFIG.maxQuestionChars),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) }))
    .max(20)
    .default([]),
});

/**
 * POST /api/rong → streams Rồng's answer as plain text. The full answer is reviewed by the
 * guardrail checks and logged once the stream ends (ai_messages).
 */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid request" }, { status: 400 });
  const { question, history } = parsed.data;
  const userId = await getUserId();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        const gen = streamRongAnswer(question, history, loadVoice());
        let step = await gen.next();
        while (!step.done) {
          full += step.value;
          controller.enqueue(encoder.encode(step.value));
          step = await gen.next();
        }
        const { text, flags } = reviewReply(full);
        await logAiMessage({ userId, surface: "rong", question, answer: text, mode: step.value.mode, model: step.value.model, flags });
      } catch (e) {
        console.error("rong", e);
        controller.enqueue(encoder.encode((full ? "\n\n" : "") + "Rồng đang bận một chút, bạn thử lại sau nhé."));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
