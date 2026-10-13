"use client";

import { Award, Check, FileText, Heart, HeartCrack, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { completeLesson, startLessonSession, startPlacementSession, startReviewSession, submitAnswer, type LessonSummary, type SubmitResult } from "@/actions/lesson";
import { saveGoal, setActiveSegment } from "@/actions/user";
import { badgeInfo } from "@/features/badges/badges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GoalPlannerView,
  InfoView,
  EstimateView,
  MatchView,
  NumericView,
  OrderView,
  ProfileView,
  ScenarioView,
  SelectView,
  SpotView,
  type Draft,
} from "./challenge-views";
import { RiskConfirm } from "@/features/risk-profile/risk-result";
import { ReactionSimView, TimingGameView } from "@/features/simulations/sim-views";
import { TIMING_ROUNDS } from "@/features/simulations/sims";
import { parseLocaleNumber } from "./grade";
import type { Answer, ClientChallenge } from "./types";

/** What the player plays: a lesson on the path, a spaced-repetition review, or a placement test. */
export type PlayerSource = { kind: "lesson"; lessonId: string } | { kind: "review"; items: string[] } | { kind: "placement"; segmentId: string };

type Props = {
  source: PlayerSource;
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
    case "spot":
      return d.choice === undefined ? null : { type: c.type, choice: d.choice };
    case "estimate":
      return { type: c.type, value: d.value ?? c.start };
    case "reaction_sim":
      return d.reactions?.length === 3 ? { type: c.type, reactions: d.reactions } : null;
    case "timing_game":
      return d.timing?.picks.length === TIMING_ROUNDS ? { type: c.type, picks: d.timing.picks } : null;
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
export function LessonPlayer({ source, lessonTitle, challenges, hearts: initialHearts, heartsEnabled }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<{ sessionId: string; isPractice: boolean } | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in dev
    started.current = true;
    const begin =
      source.kind === "lesson" ? startLessonSession(source.lessonId) : source.kind === "review" ? startReviewSession(source.items) : startPlacementSession(source.segmentId);
    begin.then((s) => ("error" in s ? router.replace("/learn") : setSession(s))).catch((e: Error) => setError(e.message));
  }, [source, router]);
  // A placement test asks each question once: wrong answers are not re-queued.
  const retryWrong = source.kind !== "placement";
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
    if (result) return advance(result.correct === false && retryWrong ? [idx] : []);
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
        // Ungraded items (self-assessment, planner) skip the feedback panel; an estimate always shows the real number.
        if (r.correct === null && !EXPLORATORY.has(c.type)) return advance();
        setResult(r);
        if (r.outOfHearts) setOutOfHearts(true);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  if (summary) {
    const onDone = async () => {
      if (summary.placement) await setActiveSegment(summary.placement.segmentId);
      router.push("/learn");
    };
    return <Summary summary={summary} seconds={Math.round((Date.now() - startedAt) / 1000)} onDone={onDone} />;
  }

  if (outOfHearts) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-soft"><HeartCrack className="h-8 w-8 text-coral" /></span>
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
      <header className="flex flex-col gap-3 px-5 pb-3.5 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/learn" aria-label="Thoát bài học" className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-line bg-surface"><X className="h-4 w-4" /></Link>
          <p className="min-w-0 flex-1 truncate text-[15px] font-bold">{lessonTitle}</p>
          {heartsEnabled && !isPractice && <span className="flex items-center gap-1 text-sm font-bold text-coral tabular"><Heart className="h-4 w-4 fill-current" />{hearts}</span>}
          {isPractice && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-bold text-gold-deep">Ôn tập</span>}
          {source.kind === "placement" && <span className="rounded-full bg-sky-soft px-2.5 py-1 text-xs font-bold text-sky-deep">Xếp lớp</span>}
          <span className="rounded-full bg-jade-soft px-2.5 py-1 text-[13px] font-bold text-jade-deep tabular">{solved.size} / {challenges.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-label={lessonTitle}>
          <i className="block h-full rounded-full bg-jade transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
        {retryWrong && solved.has(idx) === false && queue.indexOf(idx) !== pos && (
          <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Làm lại câu sai</p>
        )}
        {c.type === "info" && <InfoView c={c} />}
        {c.type === "select" && <SelectView c={c} {...props} />}
        {c.type === "scenario" && <ScenarioView c={c} {...props} />}
        {c.type === "match" && <MatchView c={c} {...props} />}
        {c.type === "order" && <OrderView c={c} {...props} />}
        {c.type === "numeric" && <NumericView c={c} {...props} />}
        {c.type === "estimate" && <EstimateView c={c} {...props} />}
        {c.type === "spot" && <SpotView c={c} {...props} />}
        {c.type === "reaction_sim" && <ReactionSimView c={c} {...props} />}
        {c.type === "timing_game" && <TimingGameView c={c} {...props} />}
        {c.type === "profile" && <ProfileView c={c} {...props} />}
        {c.type === "goal_planner" && <GoalPlannerView c={c} {...props} />}
        {error && <p role="alert" className="rounded-xl bg-coral-soft p-3 text-sm text-coral-deep">{error}</p>}
      </div>

      <Feedback result={result} kind={c.type} />
      <div className={cn("px-5 pb-6 pt-3.5", result ? (result.correct ? "bg-jade-soft" : result.correct === null ? "bg-sky-soft" : "bg-coral-soft") : "border-t border-line bg-surface")}>
        <Button
          variant={result ? (result.correct ? "primary" : result.correct === null ? "sky" : "coral") : "primary"}
          disabled={!answer || pending || !session}
          onClick={onPrimary}
        >
          {result || c.type === "info" ? "Tiếp tục" : c.type === "goal_planner" ? "Lưu mục tiêu" : c.type === "profile" ? "Tiếp tục" : c.type === "reaction_sim" || c.type === "timing_game" ? "Xem nhận xét" : "Kiểm tra"}
        </Button>
      </div>
    </main>
  );
}

/** Ungraded items that still end with the insight panel. */
const EXPLORATORY = new Set(["estimate", "reaction_sim", "timing_game"]);

function Feedback({ result, kind }: { result: SubmitResult | null; kind: string }) {
  if (!result) return null;
  // correct === null here means an estimate that wasn't close: not wrong, just "here is the real number".
  const tone = result.correct ? "ok" : result.correct === null ? "info" : "wrong";
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-2 px-5 pt-4",
        tone === "ok" ? "bg-jade-soft text-jade-deep" : tone === "info" ? "bg-sky-soft text-sky-deep" : "bg-coral-soft text-coral-deep",
      )}
    >
      <p className="flex items-center gap-2 font-display text-xl font-extrabold">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-on-accent", tone === "ok" ? "bg-jade" : tone === "info" ? "bg-sky" : "bg-coral")}>
          {tone === "ok" ? <Check className="h-4 w-4" /> : tone === "info" ? <Sparkles className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </span>
        {tone === "ok" ? "Chính xác!" : tone === "info" ? (kind === "estimate" ? "Chưa sát lắm" : "Điều dữ liệu cho thấy") : "Chưa đúng"}
      </p>
      <div className="text-sm text-ink">
        {tone !== "ok" && result.correctAnswer && <p className="mb-1">{tone === "info" ? "Con số thật" : "Đáp án đúng"}: <b>{result.correctAnswer}</b></p>}
        {result.reveal && (
          <ul className="mb-2 grid grid-cols-2 gap-1 text-xs">
            {result.reveal.map((r) => <li key={r.label} className="rounded-lg bg-surface px-2 py-1">{r.label}: <b>{r.value.toLocaleString("vi-VN")}</b></li>)}
          </ul>
        )}
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
  const pl = summary.placement;
  return (
    <main className="flex flex-1 flex-col justify-between gap-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {p ? (
          // Risk self-check: the learner confirms the result (framework §5) before moving on.
          <RiskConfirm riskId={p.riskId} result={p.result} />
        ) : pl ? (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-soft"><Award className="h-8 w-8 text-sky" /></span>
            <h1 className="text-2xl font-extrabold">Bạn trả lời đúng {pl.score}/{pl.total} câu</h1>
            <p className="text-muted">
              {pl.unlockIndex === 0
                ? "Hãy bắt đầu từ bài đầu tiên: nền tảng vững giúp các phần sau dễ hơn."
                : pl.nextLessonTitle
                  ? <>Các bài trước đã mở để bạn ôn khi cần. Bắt đầu từ <b>{pl.nextLessonTitle}</b>.</>
                  : "Bạn đã nắm chắc cả chặng: mọi bài đều đã mở."}
            </p>
          </>
        ) : (
          <>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jade-soft"><Check className="h-8 w-8 text-jade" strokeWidth={3} /></span>
            <h1 className="text-2xl font-extrabold">{summary.perfect ? "Hoàn hảo, không sai câu nào!" : "Hoàn thành bài học!"}</h1>
          </>
        )}
        <div className="grid w-full grid-cols-3 gap-2">
          <Tile label="Điểm" value={`+${summary.xp}`} />
          <Tile label="Chuỗi" value={`${summary.streak} ngày`} />
          <Tile label="Thời gian" value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`} />
        </div>
        {summary.newBadges.length > 0 && (
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-line bg-surface p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-jade">Huy hiệu mới</p>
            {summary.newBadges.map((id) => {
              const b = badgeInfo(id);
              return b ? (
                <div key={id} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft"><Award className="h-5 w-5 text-gold" /></span>
                  <div><p className="font-extrabold">{b.title}</p><p className="text-xs text-muted">{b.description}</p></div>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
      {!p && <Button onClick={onDone}>Tiếp tục</Button>}
    </main>
  );
}

const Tile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 rounded-[14px] border border-line bg-surface p-3 text-left">
    <p className="text-[11px] text-muted">{label}</p>
    <p className="text-xl font-bold tabular">{value}</p>
  </div>
);
