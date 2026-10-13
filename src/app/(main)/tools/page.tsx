import Link from "next/link";
import type { ReactNode } from "react";
import { GoalPlannerTool } from "@/features/tools/goal-planner-tool";
import { AgeRuleTool, DcaTool, FeeImpactTool } from "@/features/tools/invest-tools";
import { OrderFlowTool } from "@/features/tools/order-flow-tool";
import { EduCostTool, RunwayTool } from "@/features/tools/plan-tools";
import { DrawdownTool, RebalanceTool, SandboxTool } from "@/features/tools/risk-tools";
import { ScrollActive } from "@/features/tools/scroll-active";
import { StartEarlyTool } from "@/features/tools/start-early-tool";
import { profileInfo } from "@content/risk";
import { getLatestProfile } from "@/db/queries";
import { getUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata = { title: "Công cụ" };

type Ctx = { profile?: { id: string; name: string } };
type Tool = { id: string; label: string; title: string; render: (ctx: Ctx) => ReactNode };

const GROUPS: { label: string; tools: Tool[] }[] = [
  {
    label: "Kế hoạch",
    tools: [
      { id: "planner", label: "Lập kế hoạch", title: "Lập kế hoạch mục tiêu", render: () => <GoalPlannerTool /> },
      { id: "start-early", label: "25 hay 45 tuổi", title: "Bắt đầu sớm: 25 hay 45 tuổi", render: () => <StartEarlyTool /> },
      { id: "runway", label: "Tự do sự nghiệp", title: "Quỹ tự do sự nghiệp", render: () => <RunwayTool /> },
      { id: "edu-cost", label: "Chi phí du học", title: "Ước tính chi phí du học", render: () => <EduCostTool /> },
    ],
  },
  {
    label: "Đầu tư",
    tools: [
      { id: "dca", label: "Góp đều (DCA)", title: "Góp đều hay đầu tư một lần", render: () => <DcaTool /> },
      { id: "fee-impact", label: "Tác động của phí", title: "Tác động của phí theo thời gian", render: () => <FeeImpactTool /> },
      { id: "age-rule", label: "100 − tuổi", title: "Phân bổ theo quy tắc 100 − tuổi", render: (ctx) => <AgeRuleTool profile={ctx.profile} /> },
    ],
  },
  {
    label: "Rủi ro",
    tools: [
      { id: "drawdown", label: "Hồi phục", title: "Giảm bao nhiêu thì cần tăng bao nhiêu", render: () => <DrawdownTool /> },
      { id: "sandbox", label: "Danh mục thử nghiệm", title: "Danh mục thử nghiệm qua ba kịch bản", render: () => <SandboxTool /> },
      { id: "rebalance", label: "Tái cân bằng", title: "Tái cân bằng danh mục", render: () => <RebalanceTool /> },
    ],
  },
  {
    label: "Giao dịch",
    tools: [{ id: "order-flow", label: "Vòng đời lệnh", title: "Vòng đời một lệnh quỹ mở", render: () => <OrderFlowTool /> }],
  },
];

const ALL = GROUPS.flatMap((g) => g.tools);

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const active = ALL.find((t) => t.id === tool) ?? ALL[0];
  // Only a confirmed profile from the current framework links to the age rule.
  const risk = active.id === "age-rule" ? await getLatestProfile(await getUserId()) : undefined;
  const info = risk?.frameworkVersion && risk.decision ? profileInfo(risk.finalProfile ?? risk.profile) : undefined;
  const ctx: Ctx = { profile: info ? { id: info.id, name: info.name } : undefined };
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-extrabold">Công cụ</h1>
      <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" aria-label="Chọn công cụ">
        {GROUPS.map((g) => (
          <div key={g.label} role="group" aria-label={g.label} className="flex shrink-0 items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{g.label}</span>
            {g.tools.map((t) => (
              <Link
                key={t.id}
                href={`/tools?tool=${t.id}`}
                aria-current={active.id === t.id ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-extrabold",
                  active.id === t.id ? "border-jade bg-jade-soft text-jade-deep" : "border-line text-muted",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <ScrollActive id={active.id} />
      <h2 className="text-xl font-extrabold">{active.title}</h2>
      {active.render(ctx)}
    </div>
  );
}
