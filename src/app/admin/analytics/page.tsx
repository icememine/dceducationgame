import Link from "next/link";
import { segments } from "@content/index";
import { requireStaff } from "@/features/admin/auth";
import { attemptTotals, firstTries, lessonFunnel, wrongAnswers } from "@/features/admin/queries";
import { buildFunnel, buildQuestionStats, indexChallenges, isGraded, pct, type Filter } from "@/features/admin/stats";

const TYPE_LABEL: Record<string, string> = { select: "Trắc nghiệm", scenario: "Tình huống", spot: "Tìm câu sai", match: "Nối", order: "Sắp xếp", numeric: "Đoán số" };
const th = "border-b border-line px-2 py-1.5 text-left font-extrabold";
const td = "border-b border-line px-2 py-1.5 align-top";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ segment?: string; unit?: string }> }) {
  await requireStaff("analytics");
  const sp = await searchParams;
  const filter: Filter = { segmentId: sp.segment || undefined, unitId: sp.unit || undefined };
  const index = indexChallenges(segments);
  const ids = filter.segmentId || filter.unitId
    ? [...index.values()].filter((l) => isGraded(l.challenge) && (!filter.segmentId || l.segmentId === filter.segmentId) && (!filter.unitId || l.unitId === filter.unitId)).map((l) => l.challenge.id)
    : undefined;

  let error: string | null = null;
  let questions: ReturnType<typeof buildQuestionStats> = [];
  let funnel: ReturnType<typeof buildFunnel> = [];
  try {
    const [totals, firsts, wrongs, sessions] = await Promise.all([attemptTotals(ids), firstTries(ids), wrongAnswers(ids), lessonFunnel()]);
    questions = buildQuestionStats(index, totals, firsts, wrongs, filter);
    funnel = buildFunnel(segments, sessions, filter);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Phân tích câu hỏi</h1>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1 font-bold">Chủ đề
          <select name="segment" defaultValue={filter.segmentId ?? ""} className="rounded-lg border border-line bg-surface p-2">
            <option value="">Tất cả</option>
            {segments.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.title}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 font-bold">Phần
          <select name="unit" defaultValue={filter.unitId ?? ""} className="rounded-lg border border-line bg-surface p-2">
            <option value="">Tất cả</option>
            {segments.map((s) => (
              <optgroup key={s.id} label={s.title}>
                {s.units.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <button className="rounded-lg bg-sky px-4 py-2 font-extrabold text-white">Lọc</button>
        {(filter.segmentId || filter.unitId) && <Link href="/admin/analytics" className="py-2 text-sky-deep underline">Bỏ lọc</Link>}
      </form>

      {error && <p role="alert" className="rounded-lg bg-coral-soft p-3 text-sm text-coral-deep">Không đọc được cơ sở dữ liệu: {error}</p>}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-extrabold">Câu hỏi có chấm điểm ({questions.length})</h2>
        <p className="text-sm text-muted">Đúng lần đầu = lần trả lời đầu tiên của mỗi học viên cho mỗi câu. Xếp từ thấp đến cao. Chỉ hiện câu đã có lượt trả lời.</p>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Câu</th>
                <th className={th}>Bài</th>
                <th className={`${th} text-right`}>Lượt</th>
                <th className={`${th} text-right`}>Học viên</th>
                <th className={`${th} text-right`}>Đúng lần đầu</th>
                <th className={th}>Đáp án sai phổ biến nhất</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.challenge.id}>
                  <td className={td}>
                    <Link href={`/admin/editor?c=${encodeURIComponent(q.challenge.id)}`} className="font-bold text-sky-deep hover:underline">{q.challenge.id}</Link>
                    <div className="text-xs text-muted">{TYPE_LABEL[q.challenge.type] ?? q.challenge.type}</div>
                    {"prompt" in q.challenge && <div className="max-w-sm text-xs">{q.challenge.prompt}</div>}
                  </td>
                  <td className={td}><div className="text-xs text-muted">{q.unitTitle}</div>{q.lessonTitle}</td>
                  <td className={`${td} text-right tabular-nums`}>{q.attempts}</td>
                  <td className={`${td} text-right tabular-nums`}>{q.learners}</td>
                  <td className={`${td} text-right font-extrabold tabular-nums ${q.firstTryAccuracy !== null && q.firstTryAccuracy < 0.5 ? "text-coral-deep" : ""}`}>
                    {pct(q.firstTryAccuracy)}<div className="text-xs font-normal text-muted">{q.firstCorrect}/{q.firstTries}</div>
                  </td>
                  <td className={td}>
                    {q.topWrong ? (
                      <><div className="max-w-md">{q.topWrong.text}</div><div className="text-xs text-muted">{q.topWrong.n} lượt · {pct(q.topWrong.share)} số lượt sai</div></>
                    ) : <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
              {!questions.length && <tr><td className={td} colSpan={6}>Chưa có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-extrabold">Tỷ lệ hoàn thành theo bài</h2>
        <p className="text-sm text-muted">Tính trên phiên học bài (bỏ qua phiên ôn tập và kiểm tra xếp lớp). Số lỗi trung bình tính trên phiên đã hoàn thành.</p>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Phần</th>
                <th className={th}>Bài</th>
                <th className={`${th} text-right`}>Bắt đầu</th>
                <th className={`${th} text-right`}>Hoàn thành</th>
                <th className={`${th} text-right`}>Tỷ lệ</th>
                <th className={`${th} text-right`}>Lỗi TB</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((f) => (
                <tr key={f.lessonId}>
                  <td className={`${td} text-xs text-muted`}>{f.unitTitle}</td>
                  <td className={td}>{f.lessonTitle} <span className="text-xs text-muted">({f.lessonId})</span></td>
                  <td className={`${td} text-right tabular-nums`}>{f.started}</td>
                  <td className={`${td} text-right tabular-nums`}>{f.completed}</td>
                  <td className={`${td} text-right font-extrabold tabular-nums ${f.completionRate !== null && f.completionRate < 0.6 ? "text-coral-deep" : ""}`}>{pct(f.completionRate)}</td>
                  <td className={`${td} text-right tabular-nums`}>{f.avgMistakes === null ? "—" : f.avgMistakes.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
