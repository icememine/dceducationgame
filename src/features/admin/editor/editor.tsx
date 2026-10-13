"use client";

import { useMemo, useState, useTransition } from "react";
import { createContentEdit, type ContentEditResult } from "@/actions/admin";
import { deepEqual } from "../patch";
import { FORMULA_TEXT_MIN, QUIZ_TEXT_MAX, validateChallenge, type Issue } from "../validate";
import { ListField, MascotField, NumberField, PairsField, PatternField, PersonaField, RevealField, SourceField, TextField } from "./fields";
import { ChallengePreview } from "./preview";

type Obj = Record<string, unknown>;
const EDITABLE = ["info", "select", "scenario", "spot", "match", "order", "estimate", "numeric", "reaction_sim", "timing_game"];
const LIMITS: [number, number] = [FORMULA_TEXT_MIN, QUIZ_TEXT_MAX];

/** Shifts an index field after list row `removed` was deleted. */
const shiftAfterRemove = (idx: unknown, removed: number) => (typeof idx === "number" ? (idx > removed ? idx - 1 : idx === removed ? 0 : idx) : idx);

function Form({ d, set, issues }: { d: Obj; set: (patch: Obj) => void; issues: Issue[] }) {
  const f = (key: string, label: string, opts: { multiline?: boolean; optional?: boolean; limits?: boolean } = {}) => (
    <TextField label={label} value={d[key]} onChange={(v) => set({ [key]: v })} issues={issues} path={key}
      multiline={opts.multiline} optional={opts.optional} limits={opts.limits ? LIMITS : undefined} />
  );
  const num = (key: string, label: string) => <NumberField label={label} value={d[key]} onChange={(v) => set({ [key]: v })} issues={issues} path={key} />;
  const graded = d.type !== "info";
  const answerMark = (label: string) => ({ label, index: d.answer, onPick: (i: number) => set({ answer: i }) });

  return (
    <div className="flex flex-col gap-4">
      {d.type === "info" && <>{f("title", "Tiêu đề")}{f("body", "Nội dung", { multiline: true })}<MascotField value={d.mascot} onChange={(v) => set({ mascot: v })} /></>}
      {d.type === "select" && <PatternField value={d.pattern} onChange={(v) => set({ pattern: v })} issues={issues} />}
      {d.type === "scenario" && <>{f("prompt", "Câu hỏi")}<PersonaField value={d.persona} onChange={(v) => set({ persona: v })} issues={issues} />{f("says", "Nhân vật nói (context)", { multiline: true, limits: true })}</>}
      {["select", "spot", "estimate", "numeric", "reaction_sim", "timing_game"].includes(String(d.type)) && f("context", "Bối cảnh (context)", { multiline: true, limits: true })}
      {["select", "spot", "estimate", "numeric", "match", "order"].includes(String(d.type)) && f("prompt", "Câu hỏi")}
      {(d.type === "select" || d.type === "scenario") && (
        <ListField label="Phương án" values={d.options} onChange={(v) => set({ options: v })} issues={issues} path="options" fixed={3} mark={answerMark("đáp án đúng")} />
      )}
      {d.type === "spot" && (
        <ListField label="Ba nhận định" values={d.statements} onChange={(v) => set({ statements: v })} issues={issues} path="statements" fixed={3} mark={answerMark("nhận định SAI")} />
      )}
      {d.type === "match" && (
        <>
          <ListField label="Cột trái" values={d.left} min={2} issues={issues} path="left"
            onChange={(v) => set({ left: v, pairs: v.map((_, i) => (d.pairs as number[] | undefined)?.[i] ?? i) })}
            onRemove={(i) => set({ pairs: ((d.pairs as number[]) ?? []).filter((_, k) => k !== i) })} />
          <ListField label="Cột phải" values={d.right} min={2} issues={issues} path="right" onChange={(v) => set({ right: v })}
            onRemove={(i) => set({ pairs: ((d.pairs as number[]) ?? []).map((p) => shiftAfterRemove(p, i) as number) })} />
          <PairsField left={d.left} right={d.right} pairs={d.pairs} onChange={(v) => set({ pairs: v })} issues={issues} />
        </>
      )}
      {d.type === "order" && <ListField label="Các mục theo THỨ TỰ ĐÚNG" values={d.items} min={2} movable onChange={(v) => set({ items: v })} issues={issues} path="items" />}
      {d.type === "estimate" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{num("min", "Nhỏ nhất")}{num("max", "Lớn nhất")}{num("step", "Bước")}{num("start", "Bắt đầu")}</div>
          <div className="grid grid-cols-3 gap-3">{num("answer", "Đáp án")}{num("tolerance", "Sai số tương đối (0–1)")}{f("unit", "Đơn vị")}</div>
          <RevealField value={d.reveal} onChange={(v) => set({ reveal: v })} issues={issues} />
        </>
      )}
      {d.type === "numeric" && (
        <>
          <div className="grid grid-cols-3 gap-3">{num("answer", "Đáp án")}{num("tolerance", "Sai số (tuyệt đối)")}{f("unit", "Đơn vị")}</div>
          {f("hint", "Gợi ý", { optional: true })}
        </>
      )}
      {["select", "scenario", "spot", "estimate", "numeric", "reaction_sim", "timing_game"].includes(String(d.type))
        ? f("explain", "Insight (explain)", { multiline: true, limits: true })
        : f("explain", "Giải thích", { multiline: true, optional: true })}
      <SourceField value={d.source} onChange={(v) => set({ source: v })} issues={issues} optional={!graded} />
    </div>
  );
}

function Result({ r }: { r: ContentEditResult }) {
  if (!r.ok) {
    return (
      <div role="alert" className="rounded-lg bg-coral-soft p-3 text-sm text-coral-deep">
        <p className="font-bold">{r.error}</p>
        {r.issues && <ul className="list-disc pl-5">{r.issues.map((i, k) => <li key={k}>{i.path}: {i.message}</li>)}</ul>}
      </div>
    );
  }
  if (r.mode === "pr") {
    return (
      <div className="rounded-lg bg-jade-soft p-3 text-sm">
        Đã tạo pull request: <a href={r.url} target="_blank" rel="noreferrer" className="font-bold text-jade-deep underline">{r.url}</a>
        <div className="text-xs text-muted">Nhánh {r.branch} · file {r.path} · trường đã đổi: {r.changes.join(", ")}</div>
      </div>
    );
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([r.fileText], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = r.path.split("/").pop() ?? "unit.ts";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 text-sm">
      <p>Chưa cấu hình GitHub nên chưa tạo pull request. Thay đổi cho <b>{r.path}</b> (trường: {r.changes.join(", ")}):</p>
      <pre className="max-h-96 overflow-auto rounded bg-sunken p-2 text-xs leading-5">
        {r.diff.split("\n").map((l, i) => (
          <div key={i} className={l.startsWith("+") && !l.startsWith("+++") ? "bg-jade-soft" : l.startsWith("-") && !l.startsWith("---") ? "bg-coral-soft" : l.startsWith("@@") ? "text-sky-deep" : ""}>{l || " "}</div>
        ))}
      </pre>
      <button type="button" onClick={download} className="self-start rounded-lg bg-sky px-4 py-2 font-extrabold text-white">Tải file</button>
      <p className="text-xs text-muted">Thay file này vào {r.path}, chạy <code>npx tsx scripts/check-unit.ts {r.path}</code> rồi mở pull request.</p>
    </div>
  );
}

export function ChallengeEditor({ original, github }: { original: Obj; github: boolean }) {
  const [draft, setDraft] = useState<Obj>(original);
  const [result, setResult] = useState<ContentEditResult | null>(null);
  const [pending, start] = useTransition();
  const { issues } = useMemo(() => validateChallenge(draft), [draft]);
  const editable = EDITABLE.includes(String(original.type));
  const dirty = !deepEqual(draft as never, original as never);

  const set = (patch: Obj) => {
    setResult(null);
    setDraft((d) => {
      const next = { ...d, ...patch };
      for (const k of Object.keys(patch)) if (patch[k] === undefined) delete next[k];
      return next;
    });
  };
  const submit = () => start(async () => setResult(await createContentEdit(String(original.id), draft)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4">
        <p className="text-sm text-muted">Mã <b>{String(original.id)}</b> · loại <b>{String(original.type)}</b> (không đổi được: tiến độ học viên tham chiếu mã câu).</p>
        {editable ? <Form d={draft} set={set} issues={issues} /> : (
          <p className="rounded-lg bg-gold-soft p-3 text-sm">Loại câu này chưa có biểu mẫu; xem JSON bên dưới và sửa trực tiếp trong file nội dung.</p>
        )}
        <div className={`rounded-lg p-3 text-sm ${issues.length ? "bg-coral-soft text-coral-deep" : "bg-jade-soft text-jade-deep"}`}>
          {issues.length ? (
            <><p className="font-bold">Chưa hợp lệ ({issues.length} lỗi):</p><ul className="list-disc pl-5">{issues.map((i, k) => <li key={k}>{i.path || "(câu)"}: {i.message}</li>)}</ul></>
          ) : <p className="font-bold">Hợp lệ theo schema và công thức quiz.</p>}
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!dirty || issues.length > 0 || pending} onClick={submit} className="rounded-lg bg-jade px-4 py-2 font-extrabold text-white disabled:opacity-40">
              {pending ? "Đang tạo…" : "Tạo bản sửa"}
            </button>
            <button type="button" disabled={!dirty || pending} onClick={() => { setDraft(original); setResult(null); }} className="rounded-lg border border-line px-4 py-2 font-bold disabled:opacity-40">Khôi phục bản gốc</button>
            <span className="self-center text-xs text-muted">{github ? "Sẽ mở một pull request trên GitHub." : "Chưa cấu hình GitHub: sẽ hiện diff và cho tải file."}</span>
          </div>
        )}
        {result && <Result r={result} />}
        <details className="text-xs">
          <summary className="cursor-pointer font-bold">JSON</summary>
          <pre className="mt-2 overflow-auto rounded bg-sunken p-2">{JSON.stringify(draft, null, 2)}</pre>
        </details>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-extrabold">Xem trước</h2>
        <ChallengePreview challenge={draft} />
      </section>
    </div>
  );
}
