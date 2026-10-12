"use client";

import { ChevronLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { completeOnboarding } from "@/actions/user";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { DAILY_GOAL_OPTIONS } from "@/features/gamification/rules";
import { cn } from "@/lib/utils";

// Investor-facing replacement for the prototype's "role" step: experience → starting segment.
const STARTS = [
  { id: "my-plan", title: "Tôi mới bắt đầu", sub: "Hiểu bản thân và đặt mục tiêu trước", mood: "explore" },
  { id: "fund-types", title: "Tôi biết chút ít về đầu tư", sub: "Tìm hiểu các loại quỹ", mood: "study" },
  { id: "dc-funds", title: "Tôi đang đầu tư quỹ DC", sub: "Nắm chắc sản phẩm, phí, giao dịch", mood: "analyze" },
];
const GOAL_LABEL: Record<number, string> = { 5: "Nhẹ nhàng", 10: "Đều đặn", 15: "Nghiêm túc", 20: "Tăng tốc" };

const choice = "flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 border-line bg-surface p-4 text-left font-bold aria-pressed:border-sky aria-pressed:bg-sky-soft";

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [segmentId, setSegment] = useState<string>();
  const [goal, setGoal] = useState<number>();
  const [nickname, setNickname] = useState("");
  const [pending, start] = useTransition();
  const bubble = ["Bạn đang ở đâu trên hành trình đầu tư?", "Mỗi ngày bạn muốn học bao lâu?", "Bạn muốn hiển thị tên gì trên bảng xếp hạng?"][step];

  return (
    <main className="flex flex-1 flex-col gap-5 p-5">
      <div className="flex items-center gap-3">
        <button aria-label="Quay lại" onClick={() => setStep((s) => Math.max(0, s - 1))} className="text-muted"><ChevronLeft /></button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-locked">
          <i className="block h-full rounded-full bg-jade transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Mascot mood={step === 0 ? "explore" : step === 1 ? "fight" : "celebrate"} size={80} />
        <div className="rounded-2xl border-2 border-line p-3 font-bold">{bubble}</div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {step === 0 && STARTS.map((s) => (
          <button key={s.id} className={choice} aria-pressed={segmentId === s.id} onClick={() => setSegment(s.id)}>
            <Mascot mood={s.mood} size={44} />
            <span>{s.title}<small className="block font-semibold text-muted">{s.sub}</small></span>
          </button>
        ))}
        {step === 1 && DAILY_GOAL_OPTIONS.map((m) => (
          <button key={m} className={cn(choice, "justify-between")} aria-pressed={goal === m} onClick={() => setGoal(m)}>
            <span>{GOAL_LABEL[m]}</span><span className="text-muted">{m} phút / ngày</span>
          </button>
        ))}
        {step === 2 && (
          <label className="flex flex-col gap-2 font-bold">
            Biệt danh
            <input
              value={nickname}
              maxLength={24}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ví dụ: Rồng Tích Sản"
              className="rounded-2xl border-2 border-line bg-sunken p-4 font-semibold outline-none focus:border-sky"
            />
            <small className="font-semibold text-muted">Chỉ biệt danh được hiển thị công khai, không hiển thị tên thật.</small>
          </label>
        )}
      </div>

      <Button
        disabled={pending || (step === 0 && !segmentId) || (step === 1 && !goal) || (step === 2 && !nickname.trim())}
        onClick={() =>
          step < 2 ? setStep(step + 1) : start(() => completeOnboarding({ nickname, dailyGoalMinutes: goal!, segmentId: segmentId! }))
        }
      >
        {step < 2 ? "Tiếp tục" : "Bắt đầu học"}
      </Button>
    </main>
  );
}
