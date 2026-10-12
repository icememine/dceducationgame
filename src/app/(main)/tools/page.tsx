import Link from "next/link";
import { GoalPlannerTool } from "@/features/tools/goal-planner-tool";
import { StartEarlyTool } from "@/features/tools/start-early-tool";
import { cn } from "@/lib/utils";

export const metadata = { title: "Công cụ" };

const TOOLS = [
  { id: "planner", label: "Lập kế hoạch" },
  { id: "start-early", label: "25 hay 45 tuổi" },
] as const;

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const active = TOOLS.find((t) => t.id === tool)?.id ?? "planner";
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-extrabold">Công cụ</h1>
      <nav className="grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1" aria-label="Chọn công cụ">
        {TOOLS.map((t) => (
          <Link
            key={t.id}
            href={`/tools?tool=${t.id}`}
            aria-current={active === t.id ? "page" : undefined}
            className={cn("rounded-xl py-2 text-center text-sm font-extrabold", active === t.id ? "bg-surface text-ink shadow-sm" : "text-muted")}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {active === "planner" ? <GoalPlannerTool /> : <StartEarlyTool />}
    </div>
  );
}
