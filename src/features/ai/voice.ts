/**
 * Parses the voice guide (content/ai/rong-voice.md) into its `## …` sections and picks the
 * ones each AI surface needs. Pure: the file is read by `voice-file.ts` on the server.
 */
export const VOICE_SECTIONS = ["Chung", "Hỏi Rồng", "Huấn luyện viên", "Nhân vật đóng vai", "Ví dụ"] as const;
export type VoiceSection = (typeof VOICE_SECTIONS)[number];
export type Voice = Partial<Record<VoiceSection, string>>;

/** rong = Hỏi Rồng · coach = chấm luyện tình huống · persona = nhân vật AI đóng vai. */
export type Surface = "rong" | "coach" | "persona";

const SURFACE_SECTIONS: Record<Surface, VoiceSection[]> = {
  rong: ["Chung", "Hỏi Rồng", "Ví dụ"],
  coach: ["Chung", "Huấn luyện viên"],
  persona: ["Nhân vật đóng vai"],
};

export function parseVoice(md: string): Voice {
  const voice: Voice = {};
  // Everything before the first "## " (title and editor notes) is for humans only.
  for (const part of md.split(/^## /mu).slice(1)) {
    const nl = part.indexOf("\n");
    const title = part.slice(0, nl).trim() as VoiceSection;
    if (VOICE_SECTIONS.includes(title)) voice[title] = part.slice(nl + 1).trim();
  }
  return voice;
}

export function missingSections(voice: Voice): VoiceSection[] {
  return VOICE_SECTIONS.filter((s) => !voice[s]);
}

export function voiceFor(voice: Voice, surface: Surface): string {
  return SURFACE_SECTIONS[surface]
    .filter((s) => voice[s])
    .map((s) => `${s.toUpperCase()}:\n${voice[s]}`)
    .join("\n\n");
}
