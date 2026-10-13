import { readFile } from "node:fs/promises";
import path from "node:path";
import { MASCOT_MOODS } from "@/components/mascot";
import { getOwnPlan, getPlanCardByToken } from "@/features/plan-card/queries";
import { planCardSvg } from "@/features/plan-card/svg";
import { getUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Embed the mascot so the downloaded SVG is self-contained. */
async function mascotDataUri(mood: string): Promise<string | undefined> {
  const m = mood in MASCOT_MOODS ? mood : "explore";
  try {
    const png = await readFile(path.join(process.cwd(), "public", "mascot", `${m}.png`));
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/**
 * GET /api/plan-card/<token> → the shared card as SVG (404 for unknown tokens).
 * GET /api/plan-card/me[?hide=1] → the learner's own card (cookie), for "Tải ảnh" before sharing.
 * "me" can never collide with a share token (tokens are uuids, optionally "h-" prefixed).
 */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const card =
    token === "me"
      ? (await getOwnPlan(await getUserId(), new URL(req.url).searchParams.get("hide") === "1"))?.card
      : await getPlanCardByToken(token);
  if (!card) return new Response("Not found", { status: 404 });
  const svg = planCardSvg(card, { mascotHref: await mascotDataUri(card.mascot) });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
      "content-disposition": 'inline; filename="ke-hoach-dau-tu.svg"',
    },
  });
}
