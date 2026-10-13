"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type PickerTree = {
  id: string;
  title: string;
  units: { id: string; title: string; lessons: { id: string; title: string; challenges: { id: string; type: string; label: string }[] }[] }[];
}[];

const box = "w-full rounded-lg border border-line bg-surface p-2 text-sm";

/** Segment → unit → lesson → challenge; choosing a challenge opens it (?c=<id>). */
export function ChallengePicker({ tree, selected }: { tree: PickerTree; selected?: { segmentId: string; unitId: string; lessonId: string; challengeId: string } }) {
  const router = useRouter();
  const [seg, setSeg] = useState(selected?.segmentId ?? "");
  const [unit, setUnit] = useState(selected?.unitId ?? "");
  const [lesson, setLesson] = useState(selected?.lessonId ?? "");
  const s = tree.find((x) => x.id === seg);
  const u = s?.units.find((x) => x.id === unit);
  const l = u?.lessons.find((x) => x.id === lesson);
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      <select className={box} aria-label="Chủ đề" value={seg} onChange={(e) => { setSeg(e.target.value); setUnit(""); setLesson(""); }}>
        <option value="">Chủ đề…</option>
        {tree.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
      </select>
      <select className={box} aria-label="Phần" value={unit} disabled={!s} onChange={(e) => { setUnit(e.target.value); setLesson(""); }}>
        <option value="">Phần…</option>
        {s?.units.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
      </select>
      <select className={box} aria-label="Bài" value={lesson} disabled={!u} onChange={(e) => setLesson(e.target.value)}>
        <option value="">Bài…</option>
        {u?.lessons.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
      </select>
      <select className={box} aria-label="Câu" value={l?.challenges.some((c) => c.id === selected?.challengeId) ? selected?.challengeId : ""} disabled={!l}
        onChange={(e) => e.target.value && router.push(`/admin/editor?c=${encodeURIComponent(e.target.value)}`)}>
        <option value="">Câu…</option>
        {l?.challenges.map((c, i) => <option key={c.id} value={c.id}>{i + 1}. [{c.type}] {c.label}</option>)}
      </select>
    </div>
  );
}
