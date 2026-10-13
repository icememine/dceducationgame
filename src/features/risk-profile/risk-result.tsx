"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  CONFIRMATION,
  DISCLAIMER,
  PROFILE_IDS,
  RISK_QUESTIONS,
  SECTIONS,
  needsAcknowledgement,
  profileInfo,
  type ProfileId,
  type RiskDecision,
  type RiskResult,
  type SectionId,
} from "@content/risk";
import { confirmRiskProfile } from "@/actions/risk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sectionMax = (s: SectionId) => RISK_QUESTIONS.filter((q) => q.section === s).reduce((n, q) => n + Math.max(...q.options.map((o) => o.points)), 0);
const totalMax = RISK_QUESTIONS.reduce((n, q) => n + Math.max(...q.options.map((o) => o.points)), 0);
const name = (id: string) => profileInfo(id)?.name ?? id;

/** The confirmed profile: name, description, example funds and the framework disclaimer. */
export function ProfileCard({ profile, decision }: { profile: string; decision?: string | null }) {
  const p = profileInfo(profile);
  if (!p) return null;
  return (
    <div className="flex w-full flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Hồ sơ đầu tư của bạn</p>
      <h2 className="text-3xl font-extrabold">{p.name}</h2>
      <RiskScale profile={p.id} />
      <p>{p.summary}</p>
      {decision === "higher" && <p className="text-xs text-muted">Bạn đã chọn mức cao hơn kết quả đánh giá và đã xác nhận.</p>}
      {decision === "lower" && <p className="text-xs text-muted">Bạn đã chọn mức thấp hơn kết quả đánh giá.</p>}
      <p className="text-sm">Quỹ phù hợp (ví dụ): <b>{p.funds.join(" · ")}</b></p>
      <p className="text-xs leading-snug text-muted">{DISCLAIMER}</p>
    </div>
  );
}

/** Five steps from "Rất thận trọng" to "Rất mạo hiểm", filled up to the learner's level. */
export function RiskScale({ profile, className }: { profile: string; className?: string }) {
  const level = PROFILE_IDS.indexOf(profile as (typeof PROFILE_IDS)[number]);
  return (
    <div className={cn("flex w-full max-w-[220px] flex-col gap-1", className)} aria-hidden="true">
      <div className="grid grid-cols-5 gap-1">
        {PROFILE_IDS.map((id, i) => <span key={id} className={cn("h-2 rounded-full", i <= level ? "bg-jade" : "bg-line")} style={i <= level ? { opacity: 0.45 + (0.55 * (i + 1)) / (level + 1) } : undefined} />)}
      </div>
      <div className="flex justify-between text-[10px] text-muted"><span>Thận trọng</span><span>Mạo hiểm</span></div>
    </div>
  );
}

/**
 * Result of the risk self-check and the framework's §5 confirmation step: agree, one step lower,
 * or one step higher with an acknowledgement (also required when the capacity warning applies).
 */
export function RiskConfirm({ riskId, result, continueHref = "/learn" }: { riskId: number; result: RiskResult; continueHref?: string }) {
  const [choice, setChoice] = useState<RiskDecision | null>(null);
  const [ack, setAck] = useState(false);
  const [final, setFinal] = useState<{ profile: ProfileId; decision: RiskDecision } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const level = PROFILE_IDS.indexOf(result.profile);

  const submit = (decision: RiskDecision, acknowledged: boolean) =>
    start(async () => {
      const r = await confirmRiskProfile({ riskId, decision, acknowledged });
      if ("error" in r) return setError(r.error === "acknowledgement-required" ? "Vui lòng đánh dấu xác nhận." : "Không lưu được kết quả, bạn thử lại nhé.");
      setFinal({ profile: r.finalProfile, decision });
    });

  const pick = (d: RiskDecision) => {
    setError(null);
    setAck(false);
    if (needsAcknowledgement(result, d)) setChoice(d);
    else submit(d, false);
  };

  if (final) {
    return (
      <div className="flex w-full flex-col gap-4">
        <ProfileCard profile={final.profile} decision={final.decision} />
        <Button asChild><Link href={continueHref}>Tiếp tục</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="rounded-2xl border border-line bg-surface p-3">
        <p className="flex items-baseline justify-between font-extrabold">
          Tổng điểm <span className="font-display text-2xl text-jade-deep">{result.total}<span className="text-sm text-muted">/{totalMax}</span></span>
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-xs">
          {(Object.keys(SECTIONS) as SectionId[]).map((s) => (
            <li key={s} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
              <span className="font-bold">{SECTIONS[s]}</span>
              <span className="text-muted">{result.sections[s]}/{sectionMax(s)}</span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-locked">
                <i className="block h-full rounded-full bg-jade" style={{ width: `${(result.sections[s] / sectionMax(s)) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {result.inconsistency && (
        <div className="rounded-xl bg-gold-soft p-3 text-sm">
          <p>{result.inconsistency}</p>
          <Link href="/lesson/b1-risk-check" className="mt-1 inline-block font-extrabold text-gold-deep underline">Làm lại bài đánh giá</Link>
          <span className="text-muted"> hoặc giữ câu trả lời và xác nhận bên dưới.</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-extrabold uppercase tracking-widest text-muted">Hồ sơ đầu tư phù hợp</p>
        <h2 className="text-3xl font-extrabold text-jade-deep">{name(result.profile)}</h2>
        <p>{profileInfo(result.profile)?.summary}</p>
      </div>

      {result.overrides.length > 0 && (
        <div className="rounded-xl bg-sky-soft p-3 text-sm">
          <p>Theo tổng điểm, bạn ở mức <b>{name(result.scored)}</b>. Rồng điều chỉnh vì:</p>
          <ul className="list-disc pl-5">{result.overrides.map((o) => <li key={o.rule}>{o.reason}</li>)}</ul>
        </div>
      )}
      {result.capacityWarning && <p className="rounded-xl bg-coral-soft p-3 text-sm text-coral-deep">{result.capacityWarning}</p>}

      <p className="font-bold">{CONFIRMATION.question.replace("{profile}", name(result.profile))}</p>
      <div className="flex flex-col gap-2">
        <Button disabled={pending} onClick={() => pick("agree")}>{CONFIRMATION.agree}</Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" disabled={pending || level === 0} onClick={() => pick("lower")} className="text-[13px]">
            {CONFIRMATION.lower}
          </Button>
          <Button variant="ghost" disabled={pending || level === PROFILE_IDS.length - 1} onClick={() => pick("higher")} className="text-[13px]">
            {CONFIRMATION.higher}
          </Button>
        </div>
      </div>

      {choice && (
        <div className={cn("flex flex-col gap-2 rounded-xl border-2 p-3 text-sm", choice === "higher" ? "border-coral" : "border-gold")}>
          {choice === "higher" && <p>Hồ sơ sẽ chuyển lên <b>{name(PROFILE_IDS[Math.min(level + 1, PROFILE_IDS.length - 1)])}</b>.</p>}
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 h-4 w-4 accent-[rgb(var(--jade))]" />
            <span>{choice === "higher" ? CONFIRMATION.acknowledgement : CONFIRMATION.capacityAcknowledgement}</span>
          </label>
          <Button variant={choice === "higher" ? "coral" : "gold"} disabled={!ack || pending} onClick={() => submit(choice, true)}>Xác nhận</Button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-coral-deep">{error}</p>}
    </div>
  );
}
