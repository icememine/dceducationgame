import Image from "next/image";

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
