"use client";

import { Check, FileText, Heart, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { completeLesson, startLessonSession, submitAnswer, type LessonSummary, type SubmitResult } from "@/actions/lesson";
import { saveGoal } from "@/actions/user";
import { Disclaimer } from "@/components/disclaimer";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GoalPlannerView,
  InfoView,
  MatchView,
  NumericView,
  OrderView,
  ProfileView,
  ScenarioView,
  SelectView,
  type Draft,
} from "./challenge-views";
import { RiskExplanation } from "@/features/risk-profile/risk-explanation";
import { parseLocaleNumber } from "./grade";
import type { Answer, ClientChallenge } from "./types";

type Props = {
  lessonId: string;
  lessonTitle: string;
  challenges: ClientChallenge[];
  hearts: number;
  heartsEnabled: boolean;
};

function toAnswer(c: ClientChallenge, d: Draft): Answer | null {
  switch (c.type) {
    case "info":
      return { type: "info" };
    case "select":
    case "scenario":
    case "profile":
      return d.choice === undefined ? null : { type: c.type, choice: d.choice };
    case "match":
      return d.pairs?.length === c.left.length && d.pairs.every((p) => p !== undefined) ? { type: c.type, pairs: d.pairs as number[] } : null;
    case "order":
      return d.order?.length === c.items.length ? { type: c.type, order: d.order } : null;
    case "numeric": {
      const v = parseLocaleNumber(d.text ?? "");
      return Number.isFinite(v) ? { type: c.type, value: v } : null;
    }
    case "goal_planner":
      return { type: c.type, ...(d.plan ?? c.defaults) };
  }
}

/**
 * Lesson state machine: answer → check (server grades) → feedback → next.
 * Wrong answers go to the back of the queue, so a lesson ends only when every graded
 * item has been answered correctly once (the server verifies this on completion).
 */
export function LessonPlayer({ lessonId, lessonTitle, challenges, hearts: initialHearts, heartsEnabled }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<{ sessionId: string; isPractice: boolean } | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in dev
    started.current = true;
    startLessonSession(lessonId)
      .then((s) => ("error" in s ? router.replace("/learn") : setSession(s)))
      .catch((e: Error) => setError(e.message));
  }, [lessonId, router]);
  const sessionId = session?.sessionId ?? "";
  const isPractice = session?.isPractice ?? false;
  const [queue, setQueue] = useState(() => challenges.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [hearts, setHearts] = useState(initialHearts);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [solved, setSolved] = useState(() => new Set<number>());
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [startedAt] = useState(() => Date.now());

  const idx = queue[pos];
  const c = challenges[idx];
  const answer = useMemo(() => (c ? toAnswer(c, draft) : null), [c, draft]);
  const pct = Math.round((solved.size / challenges.length) * 100);

  const advance = (extraQueue: number[] = []) => {
    const nextQueue = [...queue, ...extraQueue];
    setQueue(nextQueue);
    setDraft({});
    setResult(null);
    if (pos + 1 < nextQueue.length) return setPos(pos + 1);
    start(async () => {
      try {
        setSummary(await completeLesson(sessionId));
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const markSolved = () => setSolved((s) => new Set(s).add(idx));

  const onPrimary = () => {
    if (!c || !answer) return;
    if (result) return advance(result.correct === false ? [idx] : []);
    if (c.type === "info") {
      markSolved();
      return advance();
    }
    start(async () => {
      try {
        const r = await submitAnswer(sessionId, c.id, answer);
        if (r.outOfHearts && r.correct === null) return setOutOfHearts(true);
        setHearts(r.hearts);
        if (c.type === "goal_planner" && answer.type === "goal_planner") {
          await saveGoal({ kind: c.goal, target: answer.target, monthly: answer.monthly, initial: answer.initial, annualReturn: answer.annualReturn });
        }
        if (r.correct !== false) markSolved();
        // Ungraded items (self-assessment, planner) skip the feedback panel.
        if (r.correct === null) return advance();
        setResult(r);
        if (r.outOfHearts) setOutOfHearts(true);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  if (summary) return <Summary summary={summary} seconds={Math.round((Date.now() - startedAt) / 1000)} onDone={() => router.push("/learn")} />;

  if (outOfHearts) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="sad" size={160} />
        <h1 className="text-2xl font-extrabold">Bạn đã hết tim</h1>
        <p className="text-muted">Tim hồi lại theo thời gian. Ôn lại một bài đã học để nhận thêm tim ngay.</p>
        <Button asChild><Link href="/learn">Ôn tập để hồi tim</Link></Button>
        <Button variant="link" asChild><Link href="/learn">Để sau</Link></Button>
      </main>
    );
  }

  const locked = !!result || pending;
  const props = { draft, setDraft, locked };

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 p-4">
        <Link href="/learn" aria-label="Thoát bài học" className="text-muted"><X /></Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-locked" role="progressbar" aria-valuenow={pct} aria-label={lessonTitle}>
          <i className="block h-full rounded-full bg-jade transition-all" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        {heartsEnabled && !isPractice && <span className="flex items-center gap-1 font-extrabold text-coral"><Heart className="h-5 w-5 fill-current" />{hearts}</span>}
        {isPractice && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-extrabold text-gold-deep">Ôn tập</span>}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
        {solved.has(idx) === false && queue.indexOf(idx) !== pos && (
          <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Làm lại câu sai</p>
        )}
        {c.type === "info" && <InfoView c={c} />}
        {c.type === "select" && <SelectView c={c} {...props} />}
        {c.type === "scenario" && <ScenarioView c={c} {...props} />}
        {c.type === "match" && <MatchView c={c} {...props} />}
        {c.type === "order" && <OrderView c={c} {...props} />}
        {c.type === "numeric" && <NumericView c={c} {...props} />}
        {c.type === "profile" && <ProfileView c={c} {...props} />}
        {c.type === "goal_planner" && <GoalPlannerView c={c} {...props} />}
        {error && <p role="alert" className="rounded-xl bg-coral-soft p-3 text-sm text-coral-deep">{error}</p>}
      </div>

      <Feedback result={result} />
      <div className={cn("p-4", result && (result.correct ? "bg-jade-soft" : "bg-coral-soft"))}>
        <Button
          variant={result ? (result.correct ? "primary" : "coral") : "primary"}
          disabled={!answer || pending || !session}
          onClick={onPrimary}
        >
          {result || c.type === "info" ? "Tiếp tục" : c.type === "goal_planner" ? "Lưu mục tiêu" : c.type === "profile" ? "Tiếp tục" : "Kiểm tra"}
        </Button>
      </div>
    </main>
  );
}

function Feedback({ result }: { result: SubmitResult | null }) {
  if (!result || result.correct === null) return null;
  const ok = result.correct;
  return (
    <div role="status" className={cn("flex flex-col gap-2 px-5 pt-4", ok ? "bg-jade-soft text-jade-deep" : "bg-coral-soft text-coral-deep")}>
      <p className="flex items-center gap-2 font-display text-xl font-extrabold">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white", ok ? "bg-jade" : "bg-coral")}>{ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
        {ok ? "Chính xác!" : "Chưa đúng"}
      </p>
      <div className="text-sm text-ink">
        {!ok && result.correctAnswer && <p className="mb-1">Đáp án đúng: <b>{result.correctAnswer}</b></p>}
        {result.explain && <p><b>Điều cần nhớ: </b>{result.explain}</p>}
      </div>
      {result.source && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <FileText className="h-3.5 w-3.5" />Nguồn: <b>{result.source.title}</b>
        </p>
      )}
    </div>
  );
}

function Summary({ summary, seconds, onDone }: { summary: LessonSummary; seconds: number; onDone: () => void }) {
  const p = summary.profile;
  return (
    <main className="flex flex-1 flex-col justify-between gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mascot mood={p ? p.mascot : summary.perfect ? "trophy" : "celebrate"} size={150} />
        {p ? (
          <>
            <p className="text-sm font-extrabold uppercase tracking-widest text-muted">Mức rủi ro phù hợp với bạn lúc này</p>
            <h1 className="text-3xl font-extrabold text-jade-deep">{p.name}</h1>
            <p>{p.summary}</p>
            <RiskExplanation willingName={p.willingName} name={p.name} reasons={p.reasons} notes={p.notes} />
            <p className="text-sm">Lộ trình gợi ý: học tiếp các loại quỹ phù hợp, rồi đọc tài liệu {p.relevantFunds.join(", ")}.</p>
            <Disclaimer />
          </>
        ) : (
          <h1 className="text-2xl font-extrabold">{summary.perfect ? "Hoàn hảo, không sai câu nào!" : "Hoàn thành bài học!"}</h1>
        )}
        <div className="grid w-full grid-cols-3 gap-2">
          <Tile label="Tổng XP" value={`+${summary.xp}`} cls="bg-gold" />
          <Tile label="Chuỗi" value={`${summary.streak} ngày`} cls="bg-coral" />
          <Tile label="Thời gian" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`} cls="bg-sky" />
        </div>
      </div>
      <Button onClick={onDone}>Tiếp tục</Button>
    </main>
  );
}

const Tile = ({ label, value, cls }: { label: string; value: string; cls: string }) => (
  <div className={cn("overflow-hidden rounded-2xl border-2", cls)}>
    <p className="py-1 text-xs font-extrabold uppercase text-white">{label}</p>
    <p className="bg-surface py-2 font-extrabold">{value}</p>
  </div>
);
