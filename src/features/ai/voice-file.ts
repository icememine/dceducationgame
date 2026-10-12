import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseVoice, type Voice } from "./voice";

export const VOICE_FILE = path.join(process.cwd(), "content", "ai", "rong-voice.md");

let cached: Voice | undefined;

/** Read once per server process; in dev, edits show up after a restart (or set AI_VOICE_RELOAD=1). */
export function loadVoice(): Voice {
  if (!cached || process.env.AI_VOICE_RELOAD === "1") cached = parseVoice(readFileSync(VOICE_FILE, "utf8"));
  return cached;
}
