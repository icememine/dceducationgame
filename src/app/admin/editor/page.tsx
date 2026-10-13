import { segments } from "@content/index";
import { requireAdmin } from "@/features/admin/auth";
import { githubConfig } from "@/features/admin/content-files";
import { ChallengeEditor } from "@/features/admin/editor/editor";
import { ChallengePicker, type PickerTree } from "@/features/admin/editor/picker";
import { indexChallenges } from "@/features/admin/stats";

const label = (c: Record<string, unknown>) => {
  const t = String(c.prompt ?? c.title ?? c.context ?? c.id);
  return t.length > 70 ? `${t.slice(0, 67)}…` : t;
};

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  await requireAdmin();
  const { c } = await searchParams;
  const loc = c ? indexChallenges(segments).get(c) : undefined;
  const tree: PickerTree = segments.map((s) => ({
    id: s.id,
    title: s.title,
    units: s.units.map((u) => ({
      id: u.id,
      title: u.title,
      lessons: u.lessons.map((l) => ({ id: l.id, title: l.title, challenges: l.challenges.map((x) => ({ id: x.id, type: x.type, label: label(x) })) })),
    })),
  }));

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Trình soạn thảo câu hỏi</h1>
      <ChallengePicker
        key={c ?? ""}
        tree={tree}
        selected={loc && { segmentId: loc.segmentId, unitId: loc.unitId, lessonId: loc.lessonId, challengeId: loc.challenge.id }}
      />
      {c && !loc && <p className="rounded-lg bg-coral-soft p-3 text-sm text-coral-deep">Không có câu “{c}” trong nội dung hiện tại.</p>}
      {loc && (
        <>
          <p className="text-sm text-muted">{loc.segmentTitle} › {loc.unitTitle} › {loc.lessonTitle}</p>
          <ChallengeEditor key={loc.challenge.id} original={JSON.parse(JSON.stringify(loc.challenge))} github={!!githubConfig()} />
        </>
      )}
      {!c && <p className="text-sm text-muted">Chọn chủ đề, phần, bài rồi chọn câu để sửa. Mỗi bản sửa là một pull request để Compliance duyệt.</p>}
    </main>
  );
}
