"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/utils";
import { stripSourceLine } from "./guardrails";
import type { ChatTurn } from "./rong";

const SUGGESTIONS = [
  "Bán quỹ sau 2 năm thì mất phí và thuế gì?",
  "Đặt lệnh lúc mấy giờ thì kịp phiên?",
  "Bao lâu thì nhận được tiền bán?",
  "Mình nên mua quỹ nào bây giờ?",
  "Nhận được OTP lạ thì làm gì?",
];

/** Hỏi Rồng chat: posts to /api/rong and renders the streamed answer as it arrives. */
export function RongChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [turns]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history = turns;
    setTurns([...history, { role: "user", text: question }, { role: "assistant", text: "" }]);
    setDraft("");
    setBusy(true);
    const write = (answer: string) => setTurns((t) => [...t.slice(0, -1), { role: "assistant", text: answer }]);
    try {
      const res = await fetch("/api/rong", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, history }) });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        write(answer);
      }
      write(stripSourceLine(answer));
    } catch {
      write("Rồng đang bận một chút, anh/chị thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Mascot mood="study" size={48} />
        <p className="rounded-2xl rounded-tl-sm bg-jade-soft p-3 text-[15px]">
          Chào anh/chị! Rồng trả lời từ thư viện hỏi đáp của Dragon Capital: phí, thuế, lịch giao dịch, tài khoản và kiến thức đầu tư.
          Rồng không chọn quỹ thay anh/chị và không bao giờ hỏi OTP hay PIN.
        </p>
      </div>
      <ol className="flex flex-col gap-3" aria-live="polite">
        {turns.map((t, i) => (
          <li
            key={i}
            className={cn(
              "max-w-[85%] whitespace-pre-line rounded-2xl p-3 text-[15px]",
              t.role === "user" ? "self-end rounded-tr-sm bg-sky text-white" : "self-start rounded-tl-sm bg-jade-soft",
            )}
          >
            {t.text || <span className="text-muted">Rồng đang tra thư viện…</span>}
          </li>
        ))}
      </ol>
      <div ref={end} />
      {!busy && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="shrink-0 rounded-full border-2 border-line px-3 py-1.5 text-left text-[13px] font-bold">
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="sticky bottom-0 flex items-end gap-2 bg-surface py-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <textarea
          rows={1}
          value={draft}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(draft);
            }
          }}
          placeholder="Hỏi về quỹ, phí, giao dịch, kế hoạch…"
          aria-label="Câu hỏi cho Rồng"
          className="flex-1 resize-none rounded-2xl border-2 border-line bg-sunken p-3 text-[15px] outline-none focus:border-sky"
        />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Gửi" className="rounded-2xl bg-jade p-3 text-white disabled:bg-locked">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
