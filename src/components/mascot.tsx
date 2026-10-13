import Image from "next/image";
import { cn } from "@/lib/utils";

/** Rồng DC poses, see /public/mascot. Pick by meaning, not by looks. */
export const MASCOT_MOODS = {
  celebrate: "Ăn mừng, nhận XP",
  study: "Học bài, giải thích khái niệm",
  grow: "Tăng trưởng, lãi kép, DCA",
  trophy: "Hoàn thành phần, lên hạng",
  fight: "Động viên, giữ chuỗi ngày",
  analyze: "Đọc số liệu, hiệu suất",
  save: "Tiết kiệm, dự phòng, quỹ an toàn",
  sad: "Trả lời sai, hết tim, thị trường giảm",
  gift: "Rương thưởng, nhiệm vụ",
  explore: "Bắt đầu hành trình, onboarding",
} as const;
export type MascotMood = keyof typeof MASCOT_MOODS;

export function Mascot({ mood = "explore", size = 96, className }: { mood?: string; size?: number; className?: string }) {
  const m = (mood in MASCOT_MOODS ? mood : "explore") as MascotMood;
  return <Image src={`/mascot/${m}.png`} alt="" width={size} height={size} className={className} priority={size > 100} />;
}

const TONES = {
  jade: "bg-jade-soft",
  gold: "bg-gold-soft",
  coral: "bg-coral-soft",
  sky: "bg-sky-soft",
  violet: "bg-violet-soft",
  plain: "bg-sunken",
} as const;
export type MascotTone = keyof typeof TONES;

/**
 * Rồng DC as a small round icon: a head-and-shoulders crop of the pose in a tinted circle.
 * The crop (top 3/4, centred) keeps the face readable down to ~28px.
 */
export function MascotIcon({ mood = "explore", size = 40, tone = "jade", className }: { mood?: string; size?: number; tone?: MascotTone; className?: string }) {
  const m = (mood in MASCOT_MOODS ? mood : "explore") as MascotMood;
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full", TONES[tone], className)} style={{ width: size, height: size }} aria-hidden="true">
      <Image src={`/mascot/${m}.png`} alt="" width={size * 2} height={size * 2} className="absolute max-w-none" style={{ width: "133%", height: "133%", left: "-16.5%", top: "1%" }} />
    </span>
  );
}
