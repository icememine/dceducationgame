"use client";

import { MascotIcon } from "@/components/mascot";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LessonPlayer } from "@/features/lesson-engine/player";
import type { ClientChallenge } from "@/features/lesson-engine/types";

/**
 * Keeps the questions this session started with. Finishing the session revalidates the page,
 * and the fresh render has nothing due any more; without this the summary would be replaced
 * by the empty state.
 */
export function ReviewSession(props: { ids: string[]; challenges: ClientChallenge[]; hearts: number }) {
  const [initial] = useState(props);
  if (!initial.ids.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <MascotIcon mood="celebrate" size={88} />
        <h1 className="text-2xl font-extrabold">Không có câu nào cần ôn lúc này</h1>
        <p className="text-muted">Câu bạn từng sai sẽ quay lại sau 1, 3, 7 và 21 ngày để bạn nhớ lâu.</p>
        <Button asChild><Link href="/learn">Về lộ trình</Link></Button>
      </main>
    );
  }
  return <LessonPlayer source={{ kind: "review", items: initial.ids }} lessonTitle="Ôn tập" challenges={initial.challenges} hearts={initial.hearts} heartsEnabled />;
}
