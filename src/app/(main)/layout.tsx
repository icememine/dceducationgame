import { redirect } from "next/navigation";
import { StatusBar } from "@/components/status-bar";
import { TabBar } from "@/components/tab-bar";
import { getUserState } from "@/db/queries";
import { getUserId } from "@/lib/auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, progress, activeSegment } = await getUserState(await getUserId());
  if (!user.onboardedAt) redirect("/");
  return (
    <>
      <StatusBar segment={activeSegment} streak={progress.streak} xp={progress.xp} hearts={progress.hearts} />
      <main className="flex-1">{children}</main>
      <TabBar />
    </>
  );
}
