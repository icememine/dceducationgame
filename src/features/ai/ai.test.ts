import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GUARDRAIL_PROMPT, reviewReply } from "./guardrails";
import { buildRongRequest, offlineRongAnswer, NO_MATCH_REPLY } from "./rong";
import { missingSections, parseVoice, voiceFor } from "./voice";

const voice = parseVoice(readFileSync(path.join(process.cwd(), "content/ai/rong-voice.md"), "utf8"));

describe("voice guide", () => {
  it("keeps every section the prompts read", () => {
    expect(missingSections(voice)).toEqual([]);
  });

  it("gives each surface its own sections", () => {
    expect(voiceFor(voice, "rong")).toContain("HỎI RỒNG:");
    expect(voiceFor(voice, "rong")).toContain("TONE & MOOD:");
    expect(voiceFor(voice, "coach")).toContain("CÁCH NÓI:");
    expect(voiceFor(voice, "rong")).not.toContain("NHÂN VẬT ĐÓNG VAI:");
    expect(voiceFor(voice, "persona")).not.toContain("CHUNG:");
  });
});

describe("Hỏi Rồng request", () => {
  const history = Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? "user" : "assistant", text: `t${i}` }) as const);
  const req = buildRongRequest("Bán quỹ sau 2 năm mất phí gì?", [...history], voice);

  it("puts the fixed rules before the editable voice, and caches the library block", () => {
    const [head, lib] = req.system;
    expect(head.text.indexOf(GUARDRAIL_PROMPT)).toBeLessThan(head.text.indexOf("HƯỚNG DẪN GIỌNG ĐIỆU"));
    expect(head.cache_control).toBeUndefined();
    expect(lib.cache_control).toEqual({ type: "ephemeral" });
    expect(lib.text).toMatch(/0,1%/);
    expect(lib.text).not.toMatch(/faq:\d|is:\d/);
  });

  it("sends a bounded history that starts with the user and ends with the question", () => {
    expect(req.messages[0].role).toBe("user");
    expect(req.messages.at(-1)).toEqual({ role: "user", content: "Bán quỹ sau 2 năm mất phí gì?" });
    expect(req.messages.length).toBeLessThanOrEqual(7);
    expect(req.fallbacks).toBe("default");
  });

  it("answers from the library when no model is configured", () => {
    expect(offlineRongAnswer("bán quỹ sau 2 năm thì mất phí và thuế gì")).toMatch(/0,1%/);
    expect(offlineRongAnswer("xyz qwerty")).toBe(NO_MATCH_REPLY);
  });
});

describe("reply review", () => {
  it("flags promises but not the disclaimer that denies them", () => {
    expect(reviewReply("Quỹ này chắc chắn có lãi 20%.").flags).toContain("promise");
    expect(reviewReply("Quỹ mở không cam kết lợi nhuận.").flags).toEqual([]);
  });

  it("flags requests for secrets but not warnings about them", () => {
    expect(reviewReply("Bạn gửi Rồng mã OTP để kiểm tra nhé.").flags).toContain("asks-secret");
    expect(reviewReply("Rồng không bao giờ hỏi OTP. Đừng gửi OTP cho ai.").flags).toEqual([]);
  });

  it("strips a trailing source line", () => {
    const r = reviewReply("Phí bán là 0%.\nNguồn: FAQ 10");
    expect(r.text).toBe("Phí bán là 0%.");
    expect(r.flags).toEqual(expect.arrayContaining(["source-line", "faq-number"]));
  });
});
